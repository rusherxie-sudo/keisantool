// 円弧・扇形の純関数。長さの単位は呼び出し側で統一する。
function positive(value) {
  if (value === '' || value == null) return null;
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function toRadius(value, radiusType = 'radius') {
  const length = positive(value);
  if (length == null) return null;
  if (radiusType === 'radius') return length;
  if (radiusType === 'diameter') return length / 2;
  return null;
}

function resultFromRadiusAndAngle(radius, angle) {
  const radians = angle * Math.PI / 180;
  return {
    radius,
    diameter: radius * 2,
    angle,
    arcLength: radius * radians,
    chordLength: 2 * radius * Math.sin(radians / 2),
    sectorArea: Math.PI * radius ** 2 * angle / 360,
    circumference: 2 * Math.PI * radius,
    circleArea: Math.PI * radius ** 2,
  };
}

export function calculateArc({ radius: radiusValue, radiusType = 'radius', angle: angleValue } = {}) {
  const radius = toRadius(radiusValue, radiusType);
  const angle = positive(angleValue);
  if (radius == null || angle == null || angle > 360) return null;
  return resultFromRadiusAndAngle(radius, angle);
}

export function calculateCentralAngle({ radius: radiusValue, radiusType = 'radius', arcLength: arcValue } = {}) {
  const radius = toRadius(radiusValue, radiusType);
  const arcLength = positive(arcValue);
  if (radius == null || arcLength == null) return null;
  const circumference = 2 * Math.PI * radius;
  if (arcLength > circumference) return null;
  const angle = arcLength / radius * 180 / Math.PI;
  return resultFromRadiusAndAngle(radius, angle);
}
