import unicodedata
import re

def generate_slug(texto):
    # 1. Normaliza o texto para decompor caracteres acentuados (ex: 'é' vira 'e' + '´')
    texto = unicodedata.normalize('NFKD', texto)
    
    # 2. Mantém apenas caracteres ASCII (remove os acentos decompostos)
    texto = texto.encode('ascii', 'ignore').decode('utf-8')
    
    # 3. Converte para minúsculas
    texto = texto.lower()
    
    # 4. Remove tudo que não for letra, número ou espaço e substitui por hífen
    # O regex [^a-z0-9] busca caracteres não alfanuméricos
    slug = re.sub(r'[^a-z0-9]+', '-', texto)
    
    # 5. Remove hífens sobrando no início ou fim
    return slug.strip('-')