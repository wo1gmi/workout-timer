import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("wifi_signal.csv")

t0 = df.time.iloc[0]
df["time"] = df.time - t0

plt.plot(df.time, df.rssi)
plt.xlabel("time (s)")
plt.ylabel("signal (dBm)")
plt.title("WiFi signal variation")
plt.grid()

plt.show()
