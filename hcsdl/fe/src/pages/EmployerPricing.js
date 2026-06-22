import React, { useState, useEffect } from 'react';
import { Check, Sparkles, Zap, Crown, ArrowRight, RefreshCw } from 'lucide-react';

const FALLBACK_PLANS = [
  {
    id: 1,
    name: 'Cơ bản',
    price: 0,
    duration: 'month',
    description: 'Hoàn hảo cho công ty nhỏ mới bắt đầu',
    icon: 'sparkles',
    features: [
      { text: '5 tin tuyển dụng', included: true },
      { text: 'Hiển thị trong 30 ngày', included: true },
      { text: 'Hỗ trợ email cơ bản', included: true },
      { text: 'Truy cập hồ sơ ứng viên', included: false },
      { text: 'Phân tích chi tiết', included: false },
      { text: 'Hỗ trợ ưu tiên', included: false }
    ],
    popular: false,
    color: '#10B981'
  },
  {
    id: 2,
    name: 'Chuyên nghiệp',
    price: 299000,
    duration: 'month',
    description: 'Lý tưởng cho doanh nghiệp đang phát triển',
    icon: 'zap',
    features: [
      { text: '20 tin tuyển dụng', included: true },
      { text: 'Hiển thị trong 60 ngày', included: true },
      { text: 'Hỗ trợ email & chat', included: true },
      { text: 'Truy cập không giới hạn hồ sơ', included: true },
      { text: 'Phân tích cơ bản', included: true },
      { text: 'Hỗ trợ ưu tiên', included: false }
    ],
    popular: true,
    color: '#0A65CC'
  },
  {
    id: 3,
    name: 'Doanh nghiệp',
    price: 799000,
    duration: 'month',
    description: 'Giải pháp toàn diện cho tập đoàn lớn',
    icon: 'crown',
    features: [
      { text: 'Tin tuyển dụng không giới hạn', included: true },
      { text: 'Hiển thị không giới hạn', included: true },
      { text: 'Hỗ trợ 24/7 đa kênh', included: true },
      { text: 'Truy cập không giới hạn hồ sơ', included: true },
      { text: 'Phân tích nâng cao & báo cáo', included: true },
      { text: 'Account Manager riêng', included: true }
    ],
    popular: false,
    color: '#F59E0B'
  }
];

export default function PricingPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('month');
  const [processingPayment, setProcessingPayment] = useState(false);
  
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/packages`);
      if (!response.ok) throw new Error('Failed to fetch plans');

      const data = await response.json();
      const normalizedPlans = data?.data || data?.plans || FALLBACK_PLANS;
      setPlans(normalizedPlans);
    } catch (error) {
      console.error('Error fetching plans:', error);
      setPlans(FALLBACK_PLANS);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
  };

  const handleCheckout = async () => {
    if (!selectedPlan) {
      alert('Vui lòng chọn một gói dịch vụ');
      return;
    }

    if (selectedPlan.price === 0) {
      alert('Gói miễn phí không cần thanh toán!');
      console.log('Activating free plan:', selectedPlan);
      return;
    }

    setProcessingPayment(true);

    try {
      const response = await fetch(`${API_BASE_URL}/payments/create-payos-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          amount: calculatePrice(selectedPlan.price),
          billingCycle: billingCycle,
          returnUrl: window.location.origin + '/payment/success',
          cancelUrl: window.location.origin + '/payment/cancel'
        })
      });

      if (!response.ok) throw new Error('Failed to create payment link');

      const data = await response.json();
      
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Không thể tạo thanh toán. Vui lòng thử lại sau.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const calculatePrice = (basePrice) => {
    if (billingCycle === 'year') {
      return Math.round(basePrice * 12 * 0.8);
    }
    return basePrice;
  };

  const calculateSavings = (basePrice) => {
    if (billingCycle === 'year') {
      return basePrice * 12 * 0.2;
    }
    return 0;
  };

  const getIconComponent = (iconName) => {
    const icons = {
      sparkles: Sparkles,
      zap: Zap,
      crown: Crown
    };
    const Icon = icons[iconName] || Sparkles;
    return <Icon size={32} />;
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}>
          <RefreshCw size={40} />
        </div>
        <p style={styles.loadingText}>Đang tải gói dịch vụ...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.badge}>GIÁ TRỊ TỐT NHẤT</div>
          <h1 style={styles.title}>Chọn gói phù hợp với bạn</h1>
          <p style={styles.subtitle}>
            Linh hoạt, minh bạch và không phí ẩn. Nâng cấp hoặc hạ cấp bất cứ lúc nào.
          </p>

          {/* Billing Toggle */}
          <div style={styles.billingToggle}>
            <button
              style={{
                ...styles.toggleBtn,
                ...(billingCycle === 'month' && styles.toggleBtnActive)
              }}
              onClick={() => setBillingCycle('month')}
            >
              Hàng tháng
            </button>
            <button
              style={{
                ...styles.toggleBtn,
                ...(billingCycle === 'year' && styles.toggleBtnActive)
              }}
              onClick={() => setBillingCycle('year')}
            >
              Hàng năm
              <span style={styles.savingBadge}>Tiết kiệm 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div style={styles.plansGrid}>
          {plans.map((plan) => {
            const isSelected = selectedPlan?.id === plan.id;
            const finalPrice = calculatePrice(plan.price);
            const savings = calculateSavings(plan.price);

            return (
              <div
                key={plan.id}
                style={{
                  ...styles.planCard,
                  ...(isSelected && styles.planCardSelected),
                  ...(plan.popular && styles.planCardPopular)
                }}
                onClick={() => handleSelectPlan(plan)}
              >
                {plan.popular && (
                  <div style={styles.popularBadge}>PHỔ BIẾN NHẤT</div>
                )}

                <div style={{...styles.planIcon, background: `${plan.color}15`}}>
                  <div style={{color: plan.color}}>
                    {getIconComponent(plan.icon)}
                  </div>
                </div>

                <h3 style={styles.planName}>{plan.name}</h3>
                <p style={styles.planDescription}>{plan.description}</p>

                <div style={styles.priceSection}>
                  <div style={styles.price}>
                    {plan.price === 0 ? (
                      <span style={styles.freeText}>Miễn phí</span>
                    ) : (
                      <>
                        <span style={styles.priceAmount}>
                          {finalPrice.toLocaleString('vi-VN')}đ
                        </span>
                        <span style={styles.pricePeriod}>
                          /{billingCycle === 'month' ? 'tháng' : 'năm'}
                        </span>
                      </>
                    )}
                  </div>
                  {billingCycle === 'year' && plan.price > 0 && (
                    <div style={styles.savingText}>
                      Tiết kiệm {savings.toLocaleString('vi-VN')}đ/năm
                    </div>
                  )}
                </div>

                <ul style={styles.featureList}>
                  {plan.features.map((feature, index) => (
                    <li
                      key={index}
                      style={{
                        ...styles.featureItem,
                        ...(feature.included ? styles.featureIncluded : styles.featureExcluded)
                      }}
                    >
                      <div style={{
                        ...styles.checkIcon,
                        ...(feature.included 
                          ? {background: `${plan.color}15`, color: plan.color}
                          : {background: '#F3F4F6', color: '#9CA3AF'}
                        )
                      }}>
                        <Check size={14} strokeWidth={3} />
                      </div>
                      {feature.text}
                    </li>
                  ))}
                </ul>

                <button
                  style={{
                    ...styles.selectBtn,
                    ...(isSelected && {...styles.selectBtnActive, background: plan.color})
                  }}
                >
                  {isSelected ? 'Đã chọn' : 'Chọn gói này'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Checkout Section */}
        {selectedPlan && (
          <div style={styles.checkoutSection}>
            <div style={styles.checkoutCard}>
              <h3 style={styles.checkoutTitle}>Tóm tắt đơn hàng</h3>
              
              <div style={styles.orderSummary}>
                <div style={styles.summaryRow}>
                  <span>Gói đã chọn:</span>
                  <strong>{selectedPlan.name}</strong>
                </div>
                <div style={styles.summaryRow}>
                  <span>Chu kỳ thanh toán:</span>
                  <strong>{billingCycle === 'month' ? 'Hàng tháng' : 'Hàng năm'}</strong>
                </div>
                <div style={styles.summaryDivider}></div>
                <div style={{...styles.summaryRow, ...styles.summaryTotal}}>
                  <span>Tổng cộng:</span>
                  <strong style={{color: selectedPlan.color}}>
                    {calculatePrice(selectedPlan.price).toLocaleString('vi-VN')}đ
                  </strong>
                </div>
              </div>

              <button
                style={{
                  ...styles.checkoutBtn,
                  background: selectedPlan.color,
                  ...(processingPayment && styles.checkoutBtnDisabled)
                }}
                onClick={handleCheckout}
                disabled={processingPayment}
              >
                {processingPayment ? (
                  <>
                    <div style={styles.btnSpinner}></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    Thanh toán ngay
                    <ArrowRight size={20} />
                  </>
                )}
              </button>

              <p style={styles.secureText}>
                🔒 Thanh toán an toàn với PayOS
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#F8FAFC',
    padding: '60px 20px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
  },
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    background: '#F8FAFC',
  },
  spinner: {
    animation: 'spin 1s linear infinite',
    color: '#0A65CC',
  },
  loadingText: {
    fontSize: '16px',
    color: '#64748B',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '60px',
  },
  badge: {
    display: 'inline-block',
    padding: '6px 16px',
    background: '#0A65CC',
    color: '#fff',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '0.5px',
    marginBottom: '20px',
  },
  title: {
    fontSize: '42px',
    fontWeight: '600',
    color: '#18191C',
    marginBottom: '16px',
    lineHeight: '1.2',
  },
  subtitle: {
    fontSize: '16px',
    color: '#767F8C',
    maxWidth: '600px',
    margin: '0 auto 40px',
    lineHeight: '1.6',
  },
  billingToggle: {
    display: 'inline-flex',
    gap: '8px',
    padding: '6px',
    background: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #E4E5E8',
  },
  toggleBtn: {
    padding: '10px 20px',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#767F8C',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  toggleBtnActive: {
    background: '#0A65CC',
    color: '#fff',
  },
  savingBadge: {
    padding: '2px 8px',
    background: 'rgba(34, 197, 94, 0.15)',
    color: '#22C55E',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
  },
  plansGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px',
    marginBottom: '60px',
  },
  planCard: {
    background: '#FFFFFF',
    padding: '32px 24px',
    borderRadius: '12px',
    border: '1.5px solid #E4E5E8',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative',
    overflow: 'hidden',
  },
  planCardSelected: {
    borderColor: '#0A65CC',
    boxShadow: '0 8px 24px rgba(10, 101, 204, 0.15)',
    transform: 'translateY(-4px)',
  },
  planCardPopular: {
    borderColor: '#0A65CC',
  },
  popularBadge: {
    position: 'absolute',
    top: '16px',
    right: '-35px',
    background: '#0A65CC',
    color: '#fff',
    padding: '6px 40px',
    fontSize: '10px',
    fontWeight: '600',
    letterSpacing: '0.5px',
    transform: 'rotate(45deg)',
  },
  planIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  planName: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#18191C',
    marginBottom: '8px',
  },
  planDescription: {
    fontSize: '14px',
    color: '#767F8C',
    marginBottom: '24px',
    lineHeight: '1.6',
  },
  priceSection: {
    marginBottom: '28px',
  },
  price: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
    marginBottom: '8px',
  },
  freeText: {
    fontSize: '32px',
    fontWeight: '600',
    color: '#10B981',
  },
  priceAmount: {
    fontSize: '36px',
    fontWeight: '600',
    color: '#18191C',
  },
  pricePeriod: {
    fontSize: '14px',
    color: '#767F8C',
    fontWeight: '500',
  },
  savingText: {
    fontSize: '13px',
    color: '#22C55E',
    fontWeight: '500',
  },
  featureList: {
    listStyle: 'none',
    padding: '0',
    margin: '0 0 28px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
  },
  featureIncluded: {
    color: '#18191C',
  },
  featureExcluded: {
    color: '#9CA3AF',
    textDecoration: 'line-through',
  },
  checkIcon: {
    width: '22px',
    height: '22px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: '0',
  },
  selectBtn: {
    width: '100%',
    padding: '12px',
    background: '#F1F5F9',
    color: '#5E6670',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  selectBtnActive: {
    color: '#fff',
  },
  checkoutSection: {
    marginBottom: '60px',
  },
  checkoutCard: {
    maxWidth: '500px',
    margin: '0 auto',
    background: '#FFFFFF',
    padding: '32px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    border: '1px solid #E4E5E8',
  },
  checkoutTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#18191C',
    marginBottom: '24px',
    textAlign: 'center',
  },
  orderSummary: {
    marginBottom: '24px',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    color: '#767F8C',
    marginBottom: '12px',
  },
  summaryDivider: {
    height: '1px',
    background: '#E4E5E8',
    margin: '16px 0',
  },
  summaryTotal: {
    fontSize: '16px',
    color: '#18191C',
    marginBottom: '0',
  },
  checkoutBtn: {
    width: '100%',
    padding: '14px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: '500',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    marginBottom: '16px',
  },
  checkoutBtnDisabled: {
    opacity: '0.6',
    cursor: 'not-allowed',
  },
  btnSpinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  secureText: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#767F8C',
    margin: '0',
  },
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .plan-card:hover:not(.plan-card-selected) {
    border-color: #CBD5E1;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }
  
  .select-btn:hover {
    background: #E2E8F0 !important;
  }
  
  .select-btn-active:hover {
    opacity: 0.9 !important;
  }
  
  .checkout-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(10, 101, 204, 0.3);
  }
  
  .toggle-btn:hover:not(.toggle-btn-active) {
    background: #F8FAFC;
  }
  
  @media (max-width: 768px) {
    .title {
      font-size: 32px !important;
    }
    .plans-grid {
      grid-template-columns: 1fr !important;
    }
  }
`;
document.head.appendChild(styleSheet);