import os
import requests
from dotenv import load_dotenv

load_dotenv()
PEXELS_API_KEY = os.environ.get("PEXELS_API_KEY", "")

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "public", "media")
os.makedirs(OUTPUT_DIR, exist_ok=True)

queries = {
    1: "johannesburg africa skyline modern city",
    2: "messy desk server room overload",
    3: "professional team creative agency modern",
    4: "ai data visualization technology",
    5: "executive boardroom meeting corporate",
    6: "professional handshake integrity team",
    7: "success team business walking"
}

def main():
    if not PEXELS_API_KEY:
        print("NO API KEY!")
        return

    for scene, q in queries.items():
        fname = f"scene_{scene}.mp4"
        outpath = os.path.join(OUTPUT_DIR, fname)
        if os.path.exists(outpath):
            print(f"{fname} exists.")
            continue
            
        print(f"Searching Pexels for: {q}")
        r = requests.get(
            "https://api.pexels.com/videos/search",
            headers={"Authorization": PEXELS_API_KEY},
            params={"query": q, "per_page": 5, "orientation": "landscape", "size": "large"}
        )
        r.raise_for_status()
        videos = r.json().get("videos", [])
        if not videos:
            print(f"No video for {q}")
            continue
            
        best = videos[0]
        files = sorted(best.get("video_files", []), key=lambda f: f.get("width", 0), reverse=True)
        link = files[0]["link"] if files else None
        
        if link:
            print(f"Downloading {fname}...")
            vr = requests.get(link, stream=True)
            with open(outpath, "wb") as f:
                for chunk in vr.iter_content(8192):
                    f.write(chunk)
            print(f"Saved {fname}")
        else:
            print(f"Missing link for {q}")

if __name__ == "__main__":
    main()
