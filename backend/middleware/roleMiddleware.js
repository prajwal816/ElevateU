// file: middleware/roleMiddleware.js
export const isTeacher = (req, res, next) => {
    if (!req.user || req.user.role !== "Teacher") {
      res.status(403);
      throw new Error("Requires Teacher role");
    }
    next();
  };
  