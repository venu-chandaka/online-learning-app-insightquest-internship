// controllers/mentorController.js
import MentorModel from "../models/mntrModel.js";
import CourseModel from "../models/Course.js";

export const getMentorData = async (req, res) => {
  try {
    const mentorId = req.mentorId || req.body?.mentorId;
    const mentor = await MentorModel.findById(mentorId)
      .populate("courses", "title description category isPublished");

    if (!mentor)
      return res.status(404).json({ success: false, message: "Mentor not found" });

    res.json({
      success: true,
      mentorData: {
        name: mentor.name,
        email: mentor.email,
        bio: mentor.bio,
        expertise: mentor.expertise,
        experience: mentor.experience,
        socialLinks: mentor.socialLinks,
        isAccountVerified: mentor.isAccountVerified,
        profilePicture: mentor.profilePicture,
        courses: mentor.courses,
        createdAt: mentor.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✏️ Update mentor profile
export const updateMentorProfile = async (req, res) => {
  try {
    const mentorId = req.mentorId || req.body?.mentorId;
    const { name, bio, expertise, experience, socialLinks, profilePicture } = req.body;

    const updatedMentor = await MentorModel.findByIdAndUpdate(
      mentorId,
      {
        name,
        bio,
        expertise,
        experience,
        socialLinks,
        profilePicture,
      },
      { new: true }
    );

    if (!updatedMentor)
      return res.status(404).json({ success: false, message: "Mentor not found" });

    res.json({ success: true, message: "Profile updated successfully", mentor: updatedMentor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🧩 Get all students enrolled in mentor’s courses
export const getMentorStudents = async (req, res) => {
  try {
    const mentorId = req.mentorId || req.body?.mentorId;

    // Find all courses created by this mentor
    const courses = await CourseModel.find({ instructor: mentorId }).populate("enrolledStudents", "name email");
    const students = courses.flatMap((course) => course.enrolledStudents);
    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
