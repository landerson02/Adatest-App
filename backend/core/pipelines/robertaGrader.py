import torch.nn.functional as F
from huggingface_hub import hf_hub_download
import torch
from torch import nn
from transformers import AutoTokenizer, RobertaModel


class EssayClassifier(nn.Module):
    def __init__(self, config):
        super().__init__()
        self.config = config

        self.pretrained_model = RobertaModel.from_pretrained(config['model_name'], return_dict=True)

        for param in self.pretrained_model.parameters():
            param.requires_grad = False

        if self.pretrained_model.pooler is not None:
            self.pretrained_model.pooler.dense.weight.requires_grad = True
            self.pretrained_model.pooler.dense.bias.requires_grad = True
            nn.init.kaiming_uniform_(self.pretrained_model.pooler.dense.weight, nonlinearity='relu')
            nn.init.zeros_(self.pretrained_model.pooler.dense.bias)

        self.hidden = nn.Linear(self.pretrained_model.config.hidden_size, self.pretrained_model.config.hidden_size)
        self.batch_norm = nn.BatchNorm1d(self.pretrained_model.config.hidden_size)
        self.layer_norm = nn.LayerNorm(self.pretrained_model.config.hidden_size)
        self.classifier = nn.Linear(self.pretrained_model.config.hidden_size, config['n_labels'])
        nn.init.kaiming_uniform_(self.classifier.weight, nonlinearity='relu')  # xavier --> kaiming
        self.dropout = nn.Dropout(p=config.get('dropout_rate', 0.1))

    def forward(self, input_ids, attention_mask):
        # RoBERTa layer
        output = self.pretrained_model(input_ids=input_ids, attention_mask=attention_mask)
        pooled_output = torch.mean(output.last_hidden_state, 1)
        hidden_output = self.hidden(pooled_output)
        hidden_output = self.layer_norm(hidden_output)
        hidden_output = F.relu(hidden_output)

        hidden_output = hidden_output + pooled_output

        hidden_output = self.dropout(hidden_output)

        logits = self.classifier(hidden_output)

        return logits


class CUPipeline:
    def __init__(self, model_type):
        if model_type == "CU0":
            repo = "aanandan/BERT_AIBAT_CU0"
            file = "sentenceLevel_CU0_BehavTest_Apr15.pth"
        else:
            repo = "aanandan/BERT_AIBAT_CU5"
            file = "sentenceLevel_CU5_BehavTest_Apr15.pth"

        model_path = hf_hub_download(repo_id=repo, filename=file)

        # Update the configuration
        self.config = {
            'model_name': 'roberta-large',
            'n_labels': 2,
        }
        self.classifier = EssayClassifier(self.config)
        if torch.cuda.is_available():
            device = 'cuda'
        else:
            device = 'cpu'
        self.classifier.load_state_dict(torch.load(model_path, map_location=torch.device(device)))
        self.tokenizer = AutoTokenizer.from_pretrained('roberta-large')
        self.mapper = {'acceptable': 1, "unacceptable": 0}

    def __call__(self, sample):
        self.classifier.eval()
        tokens = self.tokenizer.encode_plus(sample,
                                            add_special_tokens=True,
                                            return_tensors='pt',
                                            truncation=True,
                                            padding='max_length',
                                            max_length=512,
                                            return_attention_mask=True)

        input_ids = tokens.input_ids.flatten().unsqueeze(0)
        attention_mask = tokens.attention_mask.flatten().unsqueeze(0)

        with torch.no_grad():
            logits = self.classifier(input_ids, attention_mask)

            inverse_mapper = {v: k for k, v in self.mapper.items()}
            preds = torch.argmax(logits, dim=1)

            return [inverse_mapper[pred.item()] for pred in preds]