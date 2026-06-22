package com.myproject;

import java.util.*;

public class StockFeeder {
    private List<Stock> stockList = new ArrayList<>();
    private Map<String, List<StockViewer>> viewers = new HashMap<>();
    private static StockFeeder instance = null;

    private StockFeeder() {}

    public static StockFeeder getInstance() {
        if (instance == null) {
            instance = new StockFeeder();
        }
        return instance;
    }

    public void addStock(Stock stock) {
        if (stock == null || stockList.contains(stock)) {
            return;
        }
        stockList.add(stock);
        viewers.put(stock.getCode(), new ArrayList<>());
    }

    public void registerViewer(String code, StockViewer stockViewer) {
        if (!stockList.stream().anyMatch(stock -> stock.getCode().equals(code))) {
            Logger.errorRegister(code);
            return;
        }
        viewers.computeIfAbsent(code, k -> new ArrayList<>()).add(stockViewer);
    }    

    public void unregisterViewer(String code, StockViewer stockViewer) {
        List<StockViewer> viewerList = viewers.get(code);
        if (viewerList == null || !viewerList.remove(stockViewer)) {
            Logger.errorUnregister(code);
        }
    }

    public void notify(StockPrice stockPrice) {
        String code = stockPrice.getCode();
        if (viewers.containsKey(code)) {
            List<StockViewer> stockViewers = viewers.get(code);
            for (StockViewer viewer : stockViewers) {
                viewer.onUpdate(stockPrice);
            }
        }
    }
}
