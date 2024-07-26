import argparse
import sys
from rdflib import Graph


def detect_rdf_format(rdf_data):
    formats = ["xml", "n3", "turtle", "nt", "trig", "nquads", "json-ld"]
    for rdf_format in formats:
        try:
            g = Graph()
            g.parse(data=rdf_data, format=rdf_format)
            print(f"RDF format detected: {rdf_format}")
            return rdf_format
        except Exception as e:
            continue


def convert_rdf(input_data, input_format, output_format):
    g = Graph()
    try:
        g.parse(data=input_data, format=input_format)
        output_data = g.serialize(format=output_format)
        print(output_data)
    except Exception as e:
        print(f"An error occurred: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Convert RDF data from one format to another.")
    parser.add_argument('output_format', type=str,
                        help='Format of the output RDF data (e.g., "xml", "n3", "turtle", "nt", "json-ld")')
    parser.add_argument('input_format', type=str,
                        help='Format of the output RDF data (e.g., "xml", "n3", "turtle", "nt", "json-ld")')

    args = parser.parse_args()
    input_format = args.input_format
    input_data = sys.stdin.read()
    if input_format == "":
        input_format = detect_rdf_format(input_data)
    output_format = args.output_format

    convert_rdf(input_data, input_format, output_format)
