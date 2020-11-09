'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class album extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.album.belongsTo(models.user)
    }
  }
  album.init({
    name: DataTypes.STRING,
    artist: DataTypes.STRING,
    releaseYear: DataTypes.STRING,
    pictureUrl: DataTypes.STRING,
    spotifyId: DataTypes.STRING,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'album',
  });
  return album;
};