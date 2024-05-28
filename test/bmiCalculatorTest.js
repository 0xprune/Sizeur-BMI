const { expect } = require('chai');

function calculateBMI(weight, height) {
  if (weight <= 0 || height <= 0) {
    throw new Error('Weight and height must be positive numbers.');
  }
  return (weight / (height * height)).toFixed(2);
}

describe('BMI Calculator', () => {
  it('should calculate BMI correctly', () => {
    expect(calculateBMI(70, 1.75)).to.equal('22.86');
    expect(calculateBMI(50, 1.6)).to.equal('19.53');
  });

  it('should throw an error if weight or height is not positive', () => {
    expect(() => calculateBMI(-70, 1.75)).to.throw('Weight and height must be positive numbers.');
    expect(() => calculateBMI(70, -1.75)).to.throw('Weight and height must be positive numbers.');
  });
});
