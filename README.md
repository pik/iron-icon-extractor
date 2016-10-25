# iron-icon-extractor
Command Line tool for generating Polymer iron-iconset subsets based on polyicon (https://github.com/PolymerLabs/polyicon). 

## Usage

The following optional args can be passed:

- `--name` (iron-iconset name) 
- `--out`  (write output to target file)
- `--size` (iron-iconset size)

e.g.
```
./iron-icon-extractor.js 3d-rotation flag star --name 'my-icon-subset' --out 'my-icon-subset.html' --size 48
```
