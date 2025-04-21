module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('sliders', 'buttonText', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('sliders', 'buttonText');
  }
}; 