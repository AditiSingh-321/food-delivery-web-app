// Stripe / Razorpay placeholders
const processPayment = async (amount, method) => {
  // In a real application, you would integrate Stripe or Razorpay SDK here
  // const paymentIntent = await stripe.paymentIntents.create({
  //   amount: amount * 100,
  //   currency: 'usd',
  // });
  // return paymentIntent.id;

  if (method === "CASH_ON_DELIVERY") {
    return {
      success: true,
      transactionId: null,
      status: "PENDING",
    };
  }

  // Mock online payment success
  return {
    success: true,
    transactionId: "txn_" + Date.now(),
    status: "COMPLETED",
  };
};

module.exports = {
  processPayment,
};
