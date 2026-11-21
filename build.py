#!/usr/bin/env python3
"""Merakit index.html dari src/. Jalankan:  python3 build.py
Hasilnya (index.html) itulah yang dipublikasikan Vercel. Tidak ada library tambahan."""
import json,re,os
D=os.path.dirname(os.path.abspath(__file__))
rd=lambda p:open(os.path.join(D,p),encoding='utf-8',newline='').read()
t=rd('src/shell/index.template.html')
def modul(m):
    return json.dumps(rd('src/modul/%s.html'%m.group(1)),ensure_ascii=False).replace('<','\\u003c')
t=re.sub(r'\{\{MODUL:([a-z0-9-]+)\}\}',modul,t)
t=re.sub(r'\{\{INC:([A-Za-z0-9-]+)\}\}',lambda m:rd('src/shell/%s.js'%m.group(1)),t)
open(os.path.join(D,'index.html'),'w',encoding='utf-8',newline='').write(t)
print('index.html dibuat (%d karakter)'%len(t))
