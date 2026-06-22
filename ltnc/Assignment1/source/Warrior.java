public class Warrior extends Fighter {
    public Warrior(int baseHp, int wp) {
        super(baseHp, wp);
    }

    @Override
    public double getCombatScore() {
        int ground = Battle.GROUND;
        if (Utility.isPrime(ground)) {
            return Utility.check(this.getBaseHp() * 2);
        }
        return (this.getWp() == 1) ? this.getBaseHp() : this.getBaseHp() / 10.0;
    }
}
