/**
 * Calculate OT Pay based on shift and work type
 */
const calculateOtPay = (employee, schedules) => {
    const otRate = Number(employee.otRate) || 100;
    
    return schedules.reduce((total, s) => {
        // Base count for OT shifts
        if (s.shift === 'OT1' || s.shift === 'OT2') {
            let multiplier = 1.0;
            
            // Adjust multiplier based on work type
            switch (s.work_type) {
                case 'sunday':
                    multiplier = 2.0; // Sunday OT might be double
                    break;
                case 'holiday':
                    multiplier = 3.0; // Holiday OT might be triple
                    break;
                case 'extra':
                    multiplier = 1.5; // Extra work/Run in place of someone
                    break;
                default:
                    multiplier = 1.0;
            }
            
            return total + (otRate * multiplier);
        }
        return total;
    }, 0);
};

/**
 * Calculate Social Security (5% of base salary, max 750)
 */
const calculateSocialSecurity = (salary) => {
    return Math.min(salary * 0.05, 750);
};

/**
 * Calculate Security Deposit Deduction
 * Logic: Deduct until it reaches the target balance
 */
const calculateDepositDeduction = (employee, currentBalance) => {
    const target = Number(employee.deposit_target) || 5000;
    const balance = Number(currentBalance) || 0;
    
    if (balance >= target) return 0;
    
    // Default deduction 500 per month if not reached target
    const deduction = 500; 
    return Math.min(deduction, target - balance);
};

module.exports = {
    calculateOtPay,
    calculateSocialSecurity,
    calculateDepositDeduction
};
