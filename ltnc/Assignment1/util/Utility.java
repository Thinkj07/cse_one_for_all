public class Utility {

	/**
	 * Test whether a specific number is a prime number.
	 * 
	 * @param num
	 *            the number
	 * @return <code>true</code> if <code>num</code> is a prime number.
	 */
	public static boolean isPrime(int num) {
		if (num <= 1) {
            return false;
        }
        for (int i = 2; i <= Math.sqrt(num); i++) {
            if (num % i == 0) {
                return false; 
            }
        }
        return true;
	}

	/**
	 * Test whether a specific number is a square number.
	 * 
	 * @param num
	 *            the number
	 * @return <code>true</code> if <code>num</code> is a square number.
	 */
	public static boolean isSquare(int num) {
		int x = (int) Math.sqrt(num);
		return x*x == num;
	}
	/**
	 * Get the index of a Fibonacci number.
	 * 
	 * @param num
	 *            the number
	 * @return <code>index</code> of Fibonacci number.
	 */
	public static int getFibonaciIndex(int num) {
		int a = 1, b = 1, index = 2;
        while (b < num) {
            int temp = b;
            b = a + b;
            a = temp;
            index++;
        }
        return (b == num) ? index : -1;
	}
	/**
	 * check the baseHp is valid
	 * 
	 * @param num
	 *            the number
	 * @return max(<code>number</code>, 0) or min(<code>number</code>, 999)
	 */
	public static int check(int num) {
		if (num > 999) return 999;
		if (num < 0) return 0;
		return num; 
	}
}
