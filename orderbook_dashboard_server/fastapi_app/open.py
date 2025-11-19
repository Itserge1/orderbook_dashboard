import zstandard as zstd
from pathlib import Path
import io

# This Function open the file located at fastapi_app/data/glbx-mdp3-20250611.mbp-10.csv.zst
# and transform it into a csv. I accept a rows number parameter which default is 10,000

def get_records(number_of_records=10000):
    # Create the path of the zst file
    file_path = Path(__file__).parent / "data" / "glbx-mdp3-20250611.mbp-10.csv.zst"
    print(f"Zst file is located at : {file_path}")

    # Check if file exist
    if not file_path.exists():
        raise FileNotFoundError(f"Zst file is located at : {file_path} does not exist")

    # Path to save the output CSV
    output_path = Path(__file__).parent / "data" / f"output_{number_of_records}.csv"
    output_path.parent.mkdir(parents=True, exist_ok=True)  # Ensure /data exists

    # Decompress zst file
    dctx = zstd.ZstdDecompressor()

    # Fetch number of records
    with open(file_path, "rb") as f:
        reader = dctx.stream_reader(f)
        text_stream = io.TextIOWrapper(reader, encoding="utf-8")

        # Wrap the byte stream in a text wrapper
        with open(output_path, "w", encoding="utf-8") as out:
            # First, always write the header
            header = next(text_stream)
            out.write(header)

            # Then write the next N data rows
            for i, line in enumerate(text_stream, start=1):
                out.write(line)
                if i >= number_of_records:   # header + number_of_records rows
                    break

    print(f"Saved first {number_of_records} rows to {output_path}")

get_records()