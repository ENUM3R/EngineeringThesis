from django.apps import AppConfig


class DjangoappConfig(AppConfig):
    default_auto_field: str = 'django.db.models.BigAutoField'
    name: str = 'DjangoAPP'

    def ready(self) -> None:
        import DjangoAPP.signals
