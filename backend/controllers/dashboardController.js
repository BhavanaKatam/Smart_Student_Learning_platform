const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Job = require('../models/Job');
const User = require('../models/User');

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const role = req.user.role;

    const [courses, jobs, users, assignments] = await Promise.all([
      Course.find().populate('trainer', 'name').populate('students', 'name'),
      Job.find().populate('postedBy', 'name').populate('applicants.student', 'name'),
      role === 'admin' ? User.find().select('-password') : Promise.resolve([]),
      Assignment.find().populate('submissions.student', 'name'),
    ]);

    if (role === 'admin') {
      return res.json({
        role,
        stats: {
          totalUsers: users.length,
          totalCourses: courses.length,
          totalJobs: jobs.length,
          totalAssignments: assignments.length,
          students: users.filter((u) => u.role === 'student').length,
          trainers: users.filter((u) => u.role === 'trainer').length,
        },
      });
    }

    if (role === 'trainer') {
      const myCourses = courses.filter((c) => c.trainer?._id?.toString() === userId);
      const enrolledStudents = myCourses.reduce((sum, c) => sum + (c.students?.length || 0), 0);
      const myAssignments = assignments.filter((a) =>
        myCourses.some((c) => c._id.toString() === a.course.toString())
      );
      const pendingGrades = myAssignments.reduce(
        (sum, a) => sum + a.submissions.filter((s) => s.grade == null).length,
        0
      );

      return res.json({
        role,
        stats: {
          myCourses: myCourses.length,
          enrolledStudents,
          myJobPosts: jobs.filter((j) => j.postedBy?._id?.toString() === userId).length,
          totalAssignments: myAssignments.length,
          pendingGrades,
        },
      });
    }

    const enrolledCourses = courses.filter((c) =>
      c.students?.some((s) => s._id?.toString() === userId)
    );
    const appliedJobs = jobs.filter((j) =>
      j.applicants?.some((a) => a.student?._id?.toString() === userId)
    );

    const courseIds = enrolledCourses.map((c) => c._id.toString());
    const myAssignments = assignments.filter((a) => courseIds.includes(a.course.toString()));
    const submitted = myAssignments.filter((a) =>
      a.submissions.some((s) => s.student?._id?.toString() === userId)
    ).length;
    const graded = myAssignments.filter((a) => {
      const sub = a.submissions.find((s) => s.student?._id?.toString() === userId);
      return sub && sub.grade != null;
    }).length;
    const avgGrade =
      graded > 0
        ? Math.round(
            myAssignments.reduce((sum, a) => {
              const sub = a.submissions.find((s) => s.student?._id?.toString() === userId);
              return sub?.grade != null ? sum + sub.grade : sum;
            }, 0) / graded
          )
        : 0;

    const progress = enrolledCourses.map((course) => {
      const courseAssignments = myAssignments.filter(
        (a) => a.course.toString() === course._id.toString()
      );
      const done = courseAssignments.filter((a) =>
        a.submissions.some((s) => s.student?._id?.toString() === userId)
      ).length;
      const pct = courseAssignments.length
        ? Math.round((done / courseAssignments.length) * 100)
        : 0;
      return { courseId: course._id, title: course.title, progress: pct };
    });

    res.json({
      role,
      stats: {
        enrolledCourses: enrolledCourses.length,
        availableCourses: courses.length,
        appliedJobs: appliedJobs.length,
        totalAssignments: myAssignments.length,
        submittedAssignments: submitted,
        gradedAssignments: graded,
        averageGrade: avgGrade,
        courseProgress: progress,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load dashboard', error: err.message });
  }
};
