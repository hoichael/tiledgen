This app takes two PNGs (one map and one tileset) and some other information (tile dimensions, etc...) provided by the user as input, and generates fully functional TMX and TSX 
files as downloadable output. TMX and TSX files are used by the "Tiled Editor", an open source level editing software.

2 map PNGs and 1 tileset are included as examples - a purely grey variant making use of only a singular tile and one which includes some details - the app is mainly intended for greyboxed levels
and is quite impractical when used for more (visually, not geometrically) detailed maps, but it's technically possible, so I thought I might as well include an example for that. 

Important information:
- The map PNG provided by the user must be in 1:1 scale (1 pixel = 1 tile)
- <255a / <100% opacity = empty tile
- The output files are generated as TXT - simply change the file extension to tmx and tsx respectively for them to be functional
- Per default your TSX file will expect its source PNG to sit in the same directory - for a custom path simply edit the first property of the <image source/> field in your generated TSX file. Alternatively you can handle things within the Tiled GUI.

 