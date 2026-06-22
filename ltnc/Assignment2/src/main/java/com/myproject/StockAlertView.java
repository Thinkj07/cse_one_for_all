package com.myproject;

import java.util.HashMap;
import java.util.Map;

public class StockAlertView implements StockViewer {
    private double alertThresholdHigh;
    private double alertThresholdLow;
    private Map<String, Double> lastAlertedPrices = new HashMap<>(); // TODO: Stores last alerted price per stock

    public StockAlertView(double highThreshold, double lowThreshold) {
        this.alertThresholdHigh = highThreshold;
        this.alertThresholdLow = lowThreshold;
    }

    @Override
    public void onUpdate(StockPrice stockPrice) {
        String stockCode = stockPrice.getCode();
        double currentPrice = stockPrice.getAvgPrice();
        if (currentPrice >= alertThresholdHigh) {
            if (!lastAlertedPrices.containsKey(stockCode) || lastAlertedPrices.get(stockCode) != currentPrice) {
                alertAbove(stockCode, currentPrice);
                lastAlertedPrices.put(stockCode, currentPrice); // Update the last alerted price
            }
        }
        else if (currentPrice <= alertThresholdLow) {
            if (!lastAlertedPrices.containsKey(stockCode) || lastAlertedPrices.get(stockCode) != currentPrice) {
                alertBelow(stockCode, currentPrice);
                lastAlertedPrices.put(stockCode, currentPrice); 
            }
        }
    }

    private void alertAbove(String stockCode, double price) {
        Logger.logAlert(stockCode, price);
        // TODO: Call Logger to log the alert
        // Logger.notImplementedYet("alertAbove");
    }

    private void alertBelow(String stockCode, double price) {
        Logger.logAlert(stockCode, price);
        // TODO: Call Logger to log the alert
        // Logger.notImplementedYet("alertBelow");
    }
}
