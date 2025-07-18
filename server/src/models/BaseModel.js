
import { Model, DataTypes } from 'sequelize';

class BaseModel extends Model {
  /**
   * Initialize the model with the given attributes and options
   * @param {Object} attributes - Model attributes
   * @param {Object} options - Model options
   * @returns {Model} Initialized model
   */
  static init(attributes, options) {
    if (!options || !options.sequelize) {
      throw new Error('Sequelize instance is required in options.sequelize');
    }

    const { sequelize } = options;
    const { DataTypes } = sequelize.Sequelize || { DataTypes: {} };

    const defaultOptions = {
      timestamps: true,
      paranoid: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      ...options
    };

    // Add timestamps if not explicitly disabled
    if (defaultOptions.timestamps !== false) {
      attributes = {
        ...attributes,
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'created_at',
          defaultValue: DataTypes.NOW
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'updated_at',
          defaultValue: DataTypes.NOW
        },
        deleted_at: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'deleted_at'
        }
      };
    }

    return super.init(attributes, defaultOptions);
  }

  /**
   * Initialize the model with the given sequelize instance
   * @param {Object} sequelize - Sequelize instance
   * @returns {Model} Initialized model
   */
  static initialize(sequelize) {
    throw new Error('Method initialize() must be implemented by child class');
  }

  /**
   * Define model associations
   * @param {Object} models - All models
   */
  static associate(models) {
    // To be implemented by child classes
  }

  /**
   * Convert model instance to JSON, excluding sensitive fields
   * @returns {Object} JSON representation of the model
   */
  toJSON() {
    const values = { ...this.get() };
    
    // Always remove these fields
    const hiddenFields = [
      'password',
      'password_reset_token',
      'email_verification_token',
      'deleted_at'
    ];

    hiddenFields.forEach(field => {
      if (field in values) {
        delete values[field];
      }
    });

    return values;
  }

  /**
   * Reload the model instance from the database
   * @returns {Promise<BaseModel>} Reloaded model instance
   */
  async reloadWithAssociations(include = []) {
    return this.constructor.findByPk(this.id, { include });
  }

  /**
   * Find a single instance by primary key with error handling
   * @param {string|number} id - Primary key value
   * @param {Object} options - Query options
   * @returns {Promise<BaseModel>} Found instance
   * @throws {Error} If instance not found
   */
  static async findByPkOrFail(id, options = {}) {
    const instance = await this.findByPk(id, options);
    if (!instance) {
      const error = new Error(`${this.name} not found`);
      error.status = 404;
      throw error;
    }
    return instance;
  }
}

export { BaseModel };
export default BaseModel;
