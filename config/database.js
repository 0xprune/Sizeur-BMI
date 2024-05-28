const { Sequelize } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite'
});

const User = sequelize.define('User', {
  username: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

const BMI = sequelize.define('BMI', {
  weight: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  height: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  bmi: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  category: {
    type: Sequelize.STRING,
    allowNull: false
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
});

User.hasMany(BMI, { foreignKey: 'userId' });
BMI.belongsTo(User, { foreignKey: 'userId' });

sequelize.sync();

module.exports = { sequelize, User, BMI };
