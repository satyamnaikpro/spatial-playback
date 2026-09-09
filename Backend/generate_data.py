import json

START_LAT = 28.61
START_LNG = 77.21

frames = []

for t in range(10):
    frame = {
        "time": t,
        "blue": [
            {
                "lat": START_LAT + 0.002 * t,
                "lng": START_LNG + 0.002 * t
            }
        ],
        "yellow": []
    }

    # yellow appears at t=2 and t=3
    if t == 2:
        frame["yellow"].append({ "lat": 28.62, "lng": 77.22 })

    if t == 3:
        frame["yellow"].append({ "lat": 28.63, "lng": 77.23 })

    frames.append(frame)

with open("data.json", "w") as f:
    json.dump(frames, f, indent=2)

print("data.json generated")
