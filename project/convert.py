import argparse
from rdflib import Graph
from visualize import detect_rdf_format


def convert_rdf(input_file, input_format, output_file, output_format):
    # Create a graph
    g = Graph()

    try:
        # Parse the input RDF file
        g.parse(input_file, format=input_format)
        # Serialize the graph to the output RDF file
        g.serialize(destination=output_file, format=output_format)
        print(
            f"Converted {input_file} from {input_format} to {output_file} in {output_format} format.")
    except Exception as e:
        print(f"An error occurred: {e}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Convert an RDF file from one format to another.")
    parser.add_argument('output_format', type=str,
                        help='Format of the output RDF file (e.g., "xml", "n3", "turtle", "nt", "json-ld")')

    args = parser.parse_args()

    input_file = 'convert.txt'
    input_format = detect_rdf_format('./convert.txt')
    output_file = 'output.txt'
    output_format = args.output_format

    convert_rdf(input_file, input_format, output_file, output_format)
