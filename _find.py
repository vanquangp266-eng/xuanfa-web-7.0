import re, os
lines = open(r'd:\所有设备\AI课程开发\课程开发\01.宏观产品战略\宣发网页7.0\index.html','r',encoding='utf-8').readlines()
for i,l in enumerate(lines):
    if re.search(r'W[0-7]', l):
        print(f'L{i+1}: {l.strip()[:120]}')
os.remove(__file__)
