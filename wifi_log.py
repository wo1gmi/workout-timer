import subprocess
import re
import time
import pandas as pd

data = []

print("Начинаем запись сигнала... Ctrl+C для остановки")

try:
    while True:
        out = subprocess.check_output(
            "iw dev wlo1 link", shell=True
        ).decode()

        m = re.search(r"signal:\s*(-\d+)", out)

        if m:
            rssi = int(m.group(1))
            t = time.time()

            print(t, rssi)

            data.append((t, rssi))

        time.sleep(0.5)

except KeyboardInterrupt:
    pass

df = pd.DataFrame(data, columns=["time","rssi"])
df.to_csv("wifi_signal.csv", index=False)

print("Данные сохранены в wifi_signal.csv")