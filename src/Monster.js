export class Monster {
  constructor(name, health, damage, attackInterval) {
    this.name = name;
    this.health = health;
    this.damage = damage;
    this.attackInterval = attackInterval;  // Time between attacks in milliseconds
    this.attackTimer = 0;  // Timer to track when the monster attacks
  }

  // Method for the monster to attack the character
  attack(character) {
    const damageReduction = character.calculateDamageReductionFromArmor();
    const damageDealt = Math.floor(this.damage * (1 - damageReduction));
    character.currentHealth -= damageDealt;
    character.logMessage(`The ${this.name} attacked and dealt ${damageDealt} damage.`);
  }
}
