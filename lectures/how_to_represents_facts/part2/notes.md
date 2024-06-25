# How to represent facts (part2) :-

## Prefixes :-

> - Prefixes are short hand notations for namespaces. They allow you to use a short alias instead of the full IRI. A prefix declaration uses the ' @prefix' directive followed by the prefix name, the full IRI, and a period.
>
> > - example:- @prefix ex: <http://example.org/>.

## Namespaces :-

> - Namespaces are a way to group a set of IRI's under a common prefix. This helps to avoid conflicts and makes the Turtle data more readable.

## Base :-

> - The '@base' directive sets the base IRI for relative IRI's. It is similar to THE 'xml:base' attribute in RDF/XML. Any relative IRI used in the Turtle file is resolved against this base URL.
>
> > - example:- @base <http://example.org/>.

## QNames (Qualified Names) :-

> - QNames use prefixes to create compact and readable URIs, They combine a prefix with a local name separated by a colon ':'.
>
> > - example:- ex:John ex:hasAge 30.

## Statements :-

> - Statements in Turtle are RDF triples. Each statement ends with a period '.'
>
> > - example:-
> >   ex:John ex:hasName "John Doe";
> >   ex:hasAge 30;
> >   ex:hasFriend ex:Jane.
> >   ex:Jane ex:hasName "Jane Smith".
