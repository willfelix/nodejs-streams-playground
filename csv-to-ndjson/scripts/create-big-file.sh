node -e "process.stdout.write('id,name,age\n')" > ./data/bigfile.csv
for i in `seq 1 10`; do node -e "const rand = parseInt(Math.random(9999999) * 100000)
; const txt = rand + ',will-' + rand + ',' + rand + '\n'; process.stdout.write(txt.repeat(1e7))" >> ./data/bigfile.csv; done 