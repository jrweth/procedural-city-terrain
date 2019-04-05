# CIS 566 Homework 6: City Generation
J. Reuben Wetherbee (wetherbe)
## Objective
- Use procedurally generated techniques to create the terrain, highways, streets and buildings of a comletely generated city

## Demo
WebGL demo can be found at (https://jrweth.github.io/procedural-city-terrain)

![](img/final.png)

## Basic Terrain with FBM 
The first step in the city creation was to create a basic terrain height map using [Factianal Brownian Motion](https://en.wikipedia.org/wiki/Fractional_Brownian_motion).
- Water: Any heights below 0.4 were designated as water.
- Coast: Height between 0.4 and 0.43
- Land: Heights above 0.43

![](img/1_elevation.png)

## Population Distribution with Worley Noise
The population distribution was created procedurally using [Worley Noise](https://en.wikipedia.org/wiki/Worley_noise).
The areas of higher population density are designated in the image below by the darker shades.

![](img/2_population.png)

## Highway Creation using Context Sensitive L-System

### Sensitivity to Population Density
Once the population centers were created, an L-System was used to create roads to connect the population centers.
The L-system was context sensitive, so that whenever a road segment was added, a check was performed
to determine the direction of the highest population density.  The road segment was then
altered so that it would tend toward the higher population density areas.  This required a bit of parameter tuning since 
if the roads were influenced too greatly by population density they wouldn't achieve escape velocity from the centers
of population density and would circle the population density centers.  The basis for the techinique was taken from 
[Procedulal Modeling of Cities](docs/procedualCityGeneragion.pdf).

### Sensitivity to Water Terrain
The roads were also context aware of the elevation.  Since bridges do not generally curve, once a road segment was
over the water portions of the terrain, there was no branching or change of direction of the road.  A future enhancement
would be to make sure that there are no intersections of roads over the water.  This would entail checking ahead for an eventual
intersection when the road reaches the coast.

![](img/3_highways.png)

## Street Creation using Context Sensitive L-System
Using the location of the Highways and the population density, random locations for neighborhood block structures of 
streets were created.  This secondary street l-system was also context sensitive.  If the end point of a road segment ended 
close to the endpoint of another segment, the end points were coordinated and the l-system branch was terminated.

![](img/4_streets.png)

## Determining Building Site Suitability by rasterizing terrain
In order to place the buildings in our street system, the currently generated roads and environmnet was rasterized
into a grid format.  Each grid part was then evaluated for suitability for a building using the following criteria.
- On Land
- Distance from a street is within a 1/2 street block radius
- Is at least 2 grid units away from a highway or a street

The locations suitable for building location are colored in grey in the image below.

![](img/5_building_sites.png)

## Placement, Height and Footprint of Buildings using Population Density
Once the building sites were determined, buildings were randomly placed on the building sites.  Their initial 
height and footprint were randomized and then scaled according to the population density at the location.
The higher the population density, the larger the maximum height and footprint.

![](img/6_buildings.png)

## Shape Grammars and instanced rendering for generating buildings

The Buildings were created by using shape grammars. (see [Procedural Moedling of Buildings](docs/ProceduralModelingOfBuildings.pdf)). 
To speed up rendering, the different shapes were constructed
by deforming a simple cube. This way they could be rendered by the Shader and the only geometry that was necessary
was the simple cube.  

The following standard base deformations were defined.  These deformations could then be combined together create
more complex shapes.

![](img/cube_deformations.png)

## Sample building generations
The shape grammar defined for the buildings was organized so that for each replacement rule, the new shape(s) would 
fit into the footprint of the previous shapes.  This "subtractive" methodology ensured that the building would
not exceed the original building footprint.

![](img/buildings.png)


## Themed Shaders

To add a bit of pizzaz to the visual 2 different themes were implemented using the vertex and fragment WebGL shaders.
- Map: Simple shading using flat colors
- Electric Night: stylized futuristic shading for the night scene

### Building Shading - Night
The Shading of the buildings was accomplished by highlighting the underlying geometry using a luminosity that falls
off the further the distance from the original edges of the geometry.

![](img/building_shading.png)


### Road Shading - Night

Shading for the roads was accomplished by using worley noise to simulate the blacktop. Stripes and dashes were 
also added to the middle of the roads to simulate lane markers

![](img/road_shading.png)

### Land Shading - Night

Land Shading was accomplished by utilizing the original height map for the terrain created using Fractional Brownian
 Motion and mixing several colors based upon the height at the given point.

![](img/night_terrain.png)


### Water Shading - Night

Water Shading was accomplished by creating FBM in the fragment shader and applying color based upon the height
map.  The tips of the water were then given greater luminosity to simulate white caps.

![](img/water.png)

#Future Enhancements

- Add time to the shader to enhance water effects and building lighting effects
- Create much more surface detail for the buildings
- Actually change the height of the land instead of keeping it flat 