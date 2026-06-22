public class Knight extends Fighter {
    public Knight(int baseHp, int wp) {
        super(baseHp, wp);
    }

    @Override
    public double getCombatScore() {
        int ground = Battle.GROUND;
        if (Utility.isSquare(ground)) {
        return Utility.check(this.getBaseHp() * 2);
        }
        return (this.getWp() == 1) ? this.getBaseHp() : this.getBaseHp() / 10.0;
    }
}
// compile: javac -cp class -d class source/*.java util/*.java
// run: java -cp class Mainm