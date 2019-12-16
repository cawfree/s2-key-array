# s2-key-array
Convert an S2 geolocation vector into a numeric array with a smaller footprint, and vice-versa.

## 🚀 Installing
Using [npm]():
`npm install s2-key-array`

Using [yarn]():
`yarn add s2-key-array`

## 🔧 Purpose
[S2](http://blog.christianperone.com/2015/08/googles-s2-geometry-on-the-sphere-cells-and-hilbert-curve/) permits the representation of geodesic data in a highly optimized format, whereby any location on the planet can be reduced to a just 64-bit integer key with sub-centimeter resolution.

Unfortunately, Javascript only "speaks" in [IEEE 754](https://medium.com/@sarafecadu/64-bit-floating-point-a-javascript-story-fa6aad266665), which means that it is only possible to express all [thirty different levels](http://s2geometry.io/resources/s2cell_statistics.html) of S2 using a string. This greatly increases the memory overhead of the dataset, when used directly.

This library exploits the inherent redundancy in S2, whereby each level is comprised of the bits from the level which preceded it, to generate an equivalent array of integers. This representation does not "mutate" the original data in any form; it just expresses it in a more memory-efficient format for the JS runtime. This approach ensures that the data can still be easily indexed against and reconstructed back into the original S2 key without data loss.

## 🎒 Details
### `latLngToCoefficients(latitude, longitude)`

This returns an integer array of length 31, where:
  - `[0]` is the **face** of the S2 key
  - `[1 : 15]` are the **15** most significant digits of the S2 key
  - `[16 : 30]` are the **15** least significant digits of the S2 key

When we refer to "digits", we are using the convention that the position data of the S2 key is coerced into a zero-padded string of length `15`.

As an example, let's take `latititude` `37.4231492`, `longitude` `-122.0844212`. Each level expressed using conventional S2 looks like as follows:

```
[
  '4/0',
  '4/00',
  '4/001',
  '4/0010',
  '4/00101',
  '4/001013',
  '4/0010133',
  '4/00101331',
  '4/001013313',
  '4/0010133131',
  '4/00101331310',
  '4/001013313100',
  '4/0010133131000',
  '4/00101331310001',
  '4/001013313100011',
  '4/0010133131000110',
  '4/00101331310001103',
  '4/001013313100011031',
  '4/0010133131000110310',
  '4/00101331310001103103',
  '4/001013313100011031033',
  '4/0010133131000110310332',
  '4/00101331310001103103322',
  '4/001013313100011031033220',
  '4/0010133131000110310332201',
  '4/00101331310001103103322010',
  '4/001013313100011031033220100',
  '4/0010133131000110310332201000',
  '4/00101331310001103103322010003',
  '4/001013313100011031033220100031',
]
```

That's a lot of redundancy!

The resulting coefficients of a call to `latLngToCoefficients` yields the integer array:

```
[
  4,
  0,
  0,
  1000000000000,
  1000000000000,
  1010000000000,
  1013000000000,
  1013300000000,
  1013310000000,
  1013313000000,
  1013313100000,
  1013313100000,
  1013313100000,
  1013313100000,
  1013313100010,
  1013313100011,
  0,
  30000000000000,
  31000000000000,
  31000000000000,
  31030000000000,
  31033000000000,
  31033200000000,
  31033220000000,
  31033220000000,
  31033220100000,
  31033220100000,
  31033220100000,
  31033220100000,
  31033220100030,
  31033220100031,
]
```
Notice, although we're now using integers, it is perfectly possible to index against this data and reconstruct the original information without error.

### `coefficientsToS2(coefficients)`

This function can be used to convert an integer array generated by a call to `latLngToCoefficients` into a corresponding string array of length 30 whose elements are S2 keys based upon the original `latitude` and `longitude`. The index of each element is equivalent to the corresponding level minus one.

Example:

```
const { S2 } = require('s2-geometry');
const {
  latLngToCoefficients,
  coefficientsToS2,
} = require('s2-key-array');

const original = S2.latLngToKey(0, 0, 30);
const equivalent = coefficientsToS2(latLngToCoefficients(0,0))[29];

console.log(`Do pigs fly? ${!(original === equivalent)}`);
```

## ✌️ Credits
This tool wouldn't have been possible without the awesome [s2-geometry]() package.

## 👻 License
[MIT](https://opensource.org/licenses/MIT)

<p align="center">
  <a href="https://www.buymeacoffee.com/cawfree">
    <img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy @cawfree a coffee" width="232" height="50" />
  </a>
</p>
