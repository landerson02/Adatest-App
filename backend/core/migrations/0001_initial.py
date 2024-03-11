from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Test',
            fields=[
                ('id', models.CharField(max_length=50, primary_key=True, serialize=False)),
                ('title', models.TextField()),
                ('topic', models.CharField(max_length=50)),
                ('validity', models.CharField(default='Unapproved', max_length=50)),
                ('label', models.CharField(default='Unacceptable', max_length=20)),
            ],
        ),
    ]