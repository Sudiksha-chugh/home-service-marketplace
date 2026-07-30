/**
 * Booking State Machine Validation
 *
 * Transitions specification (ANTIGRAVITY_BUILD_SPEC.md section 3):
 *  requested → accepted → in_progress → completed
 *  requested → rejected
 *  requested / accepted → cancelled (cancelledBy: customer | professional | admin)
 *
 * @param {string} fromStatus Current booking status
 * @param {string} toStatus Desired target status
 * @param {string} actorRole Role of user initiating transition ('customer' | 'professional' | 'admin')
 * @returns {boolean} Returns true if transition is valid
 * @throws {Error} Throws detailed Error if transition or actor role permission is illegal
 */
export function canTransition(fromStatus, toStatus, actorRole) {
  const VALID_STATUSES = [
    "requested",
    "accepted",
    "rejected",
    "in_progress",
    "completed",
    "cancelled",
  ];

  if (!VALID_STATUSES.includes(fromStatus)) {
    throw new Error(`Invalid current status: "${fromStatus}".`);
  }

  if (!VALID_STATUSES.includes(toStatus)) {
    throw new Error(`Invalid target status: "${toStatus}".`);
  }

  if (fromStatus === toStatus) {
    throw new Error(`Booking is already in status "${fromStatus}".`);
  }

  // Allowed transitions map: fromStatus -> array of allowed target configurations
  const transitionRules = {
    requested: {
      accepted: ["professional", "admin"],
      rejected: ["professional", "admin"],
      cancelled: ["customer", "professional", "admin"],
    },
    accepted: {
      in_progress: ["professional", "admin"],
      cancelled: ["customer", "professional", "admin"],
    },
    in_progress: {
      completed: ["professional", "admin"],
    },
    rejected: {}, // terminal
    completed: {}, // terminal
    cancelled: {}, // terminal
  };

  const allowedTargets = transitionRules[fromStatus];

  if (!allowedTargets || !allowedTargets[toStatus]) {
    throw new Error(`Illegal status transition from "${fromStatus}" to "${toStatus}".`);
  }

  const allowedRoles = allowedTargets[toStatus];

  if (!allowedRoles.includes(actorRole)) {
    throw new Error(
      `Role "${actorRole}" is not authorized to transition booking from "${fromStatus}" to "${toStatus}".`
    );
  }

  return true;
}
