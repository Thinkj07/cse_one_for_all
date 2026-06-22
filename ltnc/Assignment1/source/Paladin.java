public class Paladin extends Knight {
	public Paladin(int baseHp, int wp) {
		super(baseHp, wp);
	}

	@Override
	public double getCombatScore() {
		int index = Utility.getFibonaciIndex(this.getBaseHp());
		if (index > 2) return 1000 + index;
		return this.getBaseHp() * 3;
	}
}
