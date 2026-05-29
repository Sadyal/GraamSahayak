const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, village, wardNumber, role } = req.body;

    // Check for required fields
    if (!name || !email || !phone || !password || !village || !wardNumber) {
      res.status(400);
      throw new Error('Please enter all required fields');
    }

    // Validate that village and ward exist in official records
    const Village = require('../models/Village');
    const villageRecord = await Village.findOne({ name: { $regex: `^${village}$`, $options: 'i' } });
    if (!villageRecord) {
      res.status(400);
      throw new Error('The selected Gram Panchayat village does not exist in official administrative records');
    }
    if (!villageRecord.wards.includes(wardNumber)) {
      res.status(400);
      throw new Error(`The selected Ward Number '${wardNumber}' is not officially registered for village '${village}'`);
    }

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists with this email or phone number');
    }

    // Enforce that SuperAdmin can NEVER be created through public registration
    if (role === 'SuperAdmin') {
      res.status(400);
      throw new Error('Registration for Super Admin role is strictly prohibited.');
    }

    // Determine status: Admins default to Pending, Citizens default to Approved
    const accountStatus = (role === 'Admin') ? 'Pending' : 'Approved';

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      village,
      wardNumber,
      role: role || 'Citizen',
      status: accountStatus,
    });

    if (user) {
      res.status(201).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        village: user.village,
        wardNumber: user.wardNumber,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      res.status(400);
      throw new Error('Please enter email/phone and password');
    }

    // Find by email or phone
    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });

    if (user && (await user.matchPassword(password))) {
      res.status(200).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        village: user.village,
        wardNumber: user.wardNumber,
        role: user.role,
        status: user.status,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid credentials');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.status(200).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        village: user.village,
        wardNumber: user.wardNumber,
        role: user.role,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update password/profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.village = req.body.village || user.village;
      user.wardNumber = req.body.wardNumber || user.wardNumber;
      user.phone = req.body.phone || user.phone;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.status(200).json({
        success: true,
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        village: updatedUser.village,
        wardNumber: updatedUser.wardNumber,
        role: updatedUser.role,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all admins (SuperAdmin only)
// @route   GET /api/auth/admins
// @access  Private (SuperAdmin)
const getAllAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({ role: 'Admin' }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update admin approval status (SuperAdmin only)
// @route   PATCH /api/auth/admins/:id
// @access  Private (SuperAdmin)
const updateAdminStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !['Approved', 'Rejected'].includes(status)) {
      res.status(400);
      throw new Error('Please specify a valid status: Approved or Rejected');
    }

    const admin = await User.findById(req.params.id);

    if (!admin || admin.role !== 'Admin') {
      res.status(404);
      throw new Error('Administrator account not found');
    }

    admin.status = status;
    const updatedAdmin = await admin.save();

    res.status(200).json({
      success: true,
      message: `Admin registration successfully ${status.toLowerCase()}`,
      data: updatedAdmin,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete admin account (SuperAdmin only)
// @route   DELETE /api/auth/admins/:id
// @access  Private (SuperAdmin)
const deleteAdmin = async (req, res, next) => {
  try {
    const admin = await User.findById(req.params.id);

    if (!admin || admin.role !== 'Admin') {
      res.status(404);
      throw new Error('Administrator account not found');
    }

    await admin.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Admin account deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all citizens in the admin's village (Admin only)
// @route   GET /api/auth/villagers
// @access  Private (Admin)
const getVillagers = async (req, res, next) => {
  try {
    const adminVillage = req.user.village;

    // Fetch all citizens residing in the same village
    const citizens = await User.find({ role: 'Citizen', village: { $regex: `^${adminVillage}$`, $options: 'i' } }).sort({ name: 1 });

    const Complaint = require('../models/Complaint');
    const BirthApplication = require('../models/BirthApplication');
    const DeathApplication = require('../models/DeathApplication');

    // Compile counts for each citizen
    const citizensWithStats = await Promise.all(
      citizens.map(async (citizen) => {
        const complaintCount = await Complaint.countDocuments({ citizen: citizen._id });
        const birthCount = await BirthApplication.countDocuments({ citizen: citizen._id });
        const deathCount = await DeathApplication.countDocuments({ citizen: citizen._id });

        return {
          _id: citizen._id,
          name: citizen.name,
          email: citizen.email,
          phone: citizen.phone,
          village: citizen.village,
          wardNumber: citizen.wardNumber,
          createdAt: citizen.createdAt,
          stats: {
            complaints: complaintCount,
            births: birthCount,
            deaths: deathCount,
          },
        };
      })
    );

    res.status(200).json({
      success: true,
      count: citizensWithStats.length,
      data: citizensWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a villager's profile (Admin only)
// @route   PUT /api/auth/villagers/:id
// @access  Private (Admin)
const updateVillager = async (req, res, next) => {
  try {
    const { name, email, phone, wardNumber } = req.body;
    const citizen = await User.findById(req.params.id);

    if (!citizen || citizen.role !== 'Citizen') {
      res.status(404);
      throw new Error('Villager not found');
    }

    // Village isolation check: Admin can only update citizens of their own village
    if (citizen.village.toLowerCase() !== req.user.village.toLowerCase()) {
      res.status(403);
      throw new Error('Not authorized to manage citizens of other villages');
    }

    // Check email/phone uniqueness if changed
    if (email && email !== citizen.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        res.status(400);
        throw new Error('Email is already registered by another user');
      }
      citizen.email = email;
    }

    if (phone && phone !== citizen.phone) {
      const phoneExists = await User.findOne({ phone });
      if (phoneExists) {
        res.status(400);
        throw new Error('Phone number is already registered by another user');
      }
      citizen.phone = phone;
    }

    // Validate ward number in the village
    if (wardNumber && wardNumber !== citizen.wardNumber) {
      const Village = require('../models/Village');
      const villageRecord = await Village.findOne({ name: { $regex: `^${citizen.village}$`, $options: 'i' } });
      if (villageRecord && !villageRecord.wards.includes(wardNumber)) {
        res.status(400);
        throw new Error(`Ward Number '${wardNumber}' is not valid for village '${citizen.village}'`);
      }
      citizen.wardNumber = wardNumber;
    }

    if (name) citizen.name = name;

    const updatedCitizen = await citizen.save();

    res.status(200).json({
      success: true,
      message: 'Villager profile updated successfully',
      data: {
        _id: updatedCitizen._id,
        name: updatedCitizen.name,
        email: updatedCitizen.email,
        phone: updatedCitizen.phone,
        village: updatedCitizen.village,
        wardNumber: updatedCitizen.wardNumber,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a villager account (Admin only)
// @route   DELETE /api/auth/villagers/:id
// @access  Private (Admin)
const deleteVillager = async (req, res, next) => {
  try {
    const citizen = await User.findById(req.params.id);

    if (!citizen || citizen.role !== 'Citizen') {
      res.status(404);
      throw new Error('Villager not found');
    }

    // Village isolation check
    if (citizen.village.toLowerCase() !== req.user.village.toLowerCase()) {
      res.status(403);
      throw new Error('Not authorized to manage citizens of other villages');
    }

    // Clean up citizen's grievances and certificates
    const Complaint = require('../models/Complaint');
    const BirthApplication = require('../models/BirthApplication');
    const DeathApplication = require('../models/DeathApplication');

    await Complaint.deleteMany({ citizen: citizen._id });
    await BirthApplication.deleteMany({ citizen: citizen._id });
    await DeathApplication.deleteMany({ citizen: citizen._id });

    await citizen.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Villager account and all associated grievances/certificates deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  getAllAdmins,
  updateAdminStatus,
  deleteAdmin,
  getVillagers,
  updateVillager,
  deleteVillager,
};
