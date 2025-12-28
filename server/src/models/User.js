const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db.config');

const User = sequelize.define('User', {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true 
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true 
    },
    // TRƯỜNG ẢO: Nhận dữ liệu nhưng không lưu vào MySQL
    password: {
        type: DataTypes.VIRTUAL,
        allowNull: false
    },
    // CỘT THẬT: Lưu mật khẩu đã mã hóa
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: true // Để true để Hook có thể điền giá trị sau
    },
    first_name: DataTypes.STRING(100),
    last_name: DataTypes.STRING(100),
    role: {
        type: DataTypes.ENUM('customer', 'admin'),
        allowNull: false,
        defaultValue: 'customer'
    } 
}, {
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password_hash = await bcrypt.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password_hash = await bcrypt.hash(user.password, salt);
            }
        }
    },
    tableName: 'users',
    timestamps: true
});

User.prototype.comparePassword = function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password_hash);
};

module.exports = User;