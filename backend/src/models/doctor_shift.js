"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class DoctorShift extends Model {
    static associate(models) {
      DoctorShift.belongsTo(models.Doctor, {
        foreignKey: "doctor_id",
        as: "doctor",
      });
    }
  }
  DoctorShift.init(
    {
      shift_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      doctor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Doctors",
          key: "doctor_id",
        },
        onDelete: "CASCADE",
      },
      shift_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      shift_type: {
        type: DataTypes.ENUM("morning", "afternoon"),
        allowNull: false,
      },
      start_time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      end_time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "DoctorShift",
      tableName: "doctor_shifts",
      timestamps: true,
    }
  );
  return DoctorShift;
};
