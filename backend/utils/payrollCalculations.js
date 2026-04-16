/**
 * Calculate total income from trips
 * Now pulls price from the route associated with each trip
 */
const calculateTripIncome = (schedules) => {
    return schedules.reduce((total, s) => {
        const price = s.Route ? Number(s.Route.price_per_trip) || 590 : 590;
        return total + price;
    }, 0);
};

const calculateOtPay = (employee, schedules) => {
    const otRate = Number(employee.otRate) || 100;
    return schedules.reduce((total, s) => {
        if (s.shift === 'OT1' || s.shift === 'OT2') {
            let multiplier = s.work_type === 'sunday' ? 2.0 : (s.work_type === 'holiday' ? 3.0 : 1.0);
            return total + (otRate * multiplier);
        }
        return total;
    }, 0);
};

const calculateSocialSecurity = (salary) => Math.min(salary * 0.05, 750);

const calculateDepositDeduction = (employee, currentBalance) => {
    const target = Number(employee.deposit_target) || 5000;
    const balance = Number(currentBalance) || 0;
    return balance >= target ? 0 : Math.min(500, target - balance);
};

module.exports = {
    calculateTripIncome,
    calculateOtPay,
    calculateSocialSecurity,
    calculateDepositDeduction
};
