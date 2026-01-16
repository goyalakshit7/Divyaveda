import { Lead } from "../../models/lead.master.js";
import { Role } from "../../models/role.master.js";
import { User } from "../../models/user.master.js";
import { fetchSheetRows } from "../../utils/googleSheet.js";
import { cleanLeadRow } from "../../utils/leadCleaner.js";
import { B2B } from "../../models/b2b.master.js";

/* =====================================================
   1. GET ALL LEADS (Pagination + Filters + RBAC)
===================================================== */
/* =====================================================
   1. GET ALL LEADS (Pagination + Filters + RBAC)
===================================================== */
/* =====================================================
   1. GET ALL LEADS (FIXED & DEBUGGED)
===================================================== */
export const getAllLeads = async (req, res) => {
  try {
    console.log("🔍 GET ALL LEADS QUERY:", req.query);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    const {
      search,
      platform,
      segment,
      interest_level,
      client_profile,
      from_date,
      to_date,
      assigned,
      converted,
      lead_status,
      req_time
    } = req.query;

    const user = await User.findById(req.user.id).populate("role_id");
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const roleName = user?.role_id?.role_name || "";
    const isManagerOrAbove =
      user.isSuperAdmin === true ||
      ["Manager", "Admin", "Super Admin"].includes(roleName);

    const query = { isActive: true };

    // 🔐 ROLE-BASED VISIBILITY
    if (!isManagerOrAbove) {
      query.assigned_to = user._id;
    }

    // 🔎 SEARCH
    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      query.$or = [
        { full_name: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
        { company: searchRegex }
      ];
    }

    // 🎯 EXACT MATCH FILTERS
    if (platform) query.platform = platform;
    if (segment) query.segment = segment;
    if (interest_level) query.interest_level = interest_level;
    if (client_profile) query.client_profile = client_profile;
    if (req.query.call_outcome) query.call_outcome = req.query.call_outcome;
    if (lead_status) query.lead_status = lead_status;
    if (req_time) query.req_time = req_time;

    // 👤 ASSIGNMENT FILTER
    // 👤 ASSIGNMENT FILTER (FIXED)
    if (assigned && isManagerOrAbove) {
      if (assigned === "assigned") {
        query.assigned_to = { $ne: null };
      } else if (assigned === "unassigned") {
        query.assigned_to = null;
      } else {
        query.assigned_to = assigned; // specific user ID
      }
    }


    // 🔄 CONVERTED FILTER
    if (typeof converted !== "undefined") {
      query.converted = converted === "true";
    }

    // 📅 ✅ CORRECT DATE FILTER (USES created_date STRING)
    if (from_date || to_date) {
      query.created_date = {};

      if (from_date) {
        query.created_date.$gte = from_date;
      }

      if (to_date) {
        query.created_date.$lte = to_date;
      }
    }

    const total = await Lead.countDocuments(query);
    const convertedCount = await Lead.countDocuments({ ...query, converted: true });
    const interestedCount = await Lead.countDocuments({
      ...query,
      interest_level: { $in: ["i", "hi"] }
    });
    const pendingCount = await Lead.countDocuments({ ...query, converted: false });

    const leads = await Lead.find(query)
      .populate("assigned_to", "name email")
      .populate("created_by", "name email")
      .populate("converted_by", "name email")
      .sort({ created_date: -1 }) // sort by business date
      .skip(skip)
      .limit(limit);

    res.json({
      data: leads,
      total,
      convertedCount,
      interestedCount,
      pendingCount,
      page,
      totalPages: Math.ceil(total / limit),
      limit
    });
  } catch (err) {
    console.error("❌ getAllLeads error:", err);
    res.status(500).json({ message: err.message });
  }
};


/* =====================================================
   2. CREATE LEAD (Manual)
===================================================== */
export const createLead = async (req, res) => {
  try {
    const {
      full_name, phone, email, platform, lead_status, company_name, created_date,
      segment, interest_level, req_time, client_profile, call_outcome,
      location, last_followed_up, next_follow_up, assigned_to, converted,
      converted_by, remarks, role // Added role
    } = req.body;

    const currentUser = await User.findById(req.user.id).populate("role_id");
    const isStaff = currentUser?.role_id?.role_name === "Staff";

    const leadData = {
      full_name,
      phone,
      email,
      platform,
      company: company_name, // Map company_name from frontend to company in DB
      lead_status: lead_status || "NEW",
      created_date: created_date || new Date().toISOString().split('T')[0],
      created_by: req.user.id,
      assigned_to: isStaff ? req.user.id : (assigned_to || null), // Use passed assigned_to if available and not staff
      source: "MANUAL",
      isActive: true,
      // New fields
      segment,
      interest_level,
      req_time,
      client_profile,
      call_outcome,
      location,
      role, // Persist role
      last_followed_up: last_followed_up || null,
      next_follow_up: next_follow_up || null,
      converted: converted || false,
      converted_by: converted_by || null,
    };

    // Handle initial remark if provided
    if (remarks) {
      leadData.remarks = [{
        comment: remarks,
        date: new Date(),
        by: req.user.id
      }];
    }

    const lead = await Lead.create(leadData);

    res.status(201).json({ message: "Lead created", lead });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   3. UPDATE LEAD
===================================================== */
export const updateLead = async (req, res) => {
  try {
    const leadId = req.params.id;
    const body = { ...req.body };

    const currentUser = await User.findById(req.user.id).populate("role_id");
    if (!currentUser) return res.status(401).json({ message: "Unauthorized" });

    const roleName = currentUser.role_id?.role_name || "";
    const isManagerOrAbove =
      currentUser.isSuperAdmin === true ||
      ["Manager", "Admin", "Super Admin"].includes(roleName);
    const currentUserId = String(currentUser._id);

    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    // Permission Check
    const isAssignedUser = lead.assigned_to && String(lead.assigned_to) === currentUserId;
    if (!isManagerOrAbove && !isAssignedUser) {
      return res.status(403).json({ message: "Not allowed to edit this lead" });
    }

    // Clean empty values
    ["segment", "interest_level", "req_time", "client_profile", "last_followed_up", "next_follow_up", "converted_by", "role"].forEach((field) => {
      if (body[field] === "") body[field] = null;
    });

    // Assignment (Manager only)
    if (isManagerOrAbove && Object.prototype.hasOwnProperty.call(body, "assigned_to")) {
      lead.assigned_to = body.assigned_to || null;
      lead.assigned_date = body.assigned_to ? new Date() : null;
    }

    // Editable Fields
    const editableFields = [
      "full_name", "phone", "email", "company", "platform", "segment",
      "interest_level", "req_time", "client_profile", "call_outcome",
      "last_followed_up", "next_follow_up", "location", "lead_status", "role" // Added role
    ];
    editableFields.forEach((field) => {
      if (body[field] !== undefined) lead[field] = body[field];
    });

    // Remarks
    if (body.remarks && body.remarks.trim()) {
      lead.remarks.push({ comment: body.remarks, by: currentUserId, date: new Date() });
    }

    // Conversion Logic
    if (typeof body.converted === "boolean") {
      lead.converted = body.converted;
      if (body.converted) {
        // Use the explicitly passed ID (from dropdown) OR fallback to current user
        lead.converted_by = body.converted_by || currentUserId;
        lead.converted_date = new Date();
      } else {
        lead.converted_by = null;
        lead.converted_date = null;
      }
    }

    lead.last_modified_date = new Date();
    await lead.save();

    // AUTO CREATE B2B if Converted
    if (lead.converted === true) {
      const existingB2B = await B2B.findOne({ lead_id: lead._id });
      if (!existingB2B) {
        await B2B.create({
          lead_id: lead._id,
          client_name: lead.full_name,
          mobile: lead.phone,
          email: lead.email,
          company: lead.company,
          converted_by: lead.converted_by,
          created_by: currentUserId,
          order_status: "OPEN",
          total_order_value: 0,
          amount_received: 0,
        });
      }
    }

    const updatedLead = await Lead.findById(leadId)
      .populate("assigned_to", "name email")
      .populate("created_by", "name email")
      .populate("converted_by", "name email");

    res.json({ message: "Lead updated successfully", lead: updatedLead });
  } catch (error) {
    console.error("❌ Update Lead Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   4. GET STAFF MEMBERS
===================================================== */
export const getStaffMembers = async (req, res) => {
  try {
    const roles = await Role.find({
      role_name: { $not: { $regex: /^simple_user$/i } }
    });

    const roleIds = roles.map((r) => r._id);

    const staff = await User.find({
      role_id: { $in: roleIds },
      isActive: true
    })
      .select("name email role_id")
      .populate("role_id", "role_name");

    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   5. SYNC GOOGLE SHEET LEADS
===================================================== */
export const syncGoogleSheetLeads = async (req, res) => {
  try {
    const rows = await fetchSheetRows();
    let inserted = 0;
    let skipped = 0;

    for (const row of rows) {
      const cleanLead = cleanLeadRow(row);
      if (!cleanLead) continue;

      const exists = await Lead.findOne({ phone: cleanLead.phone });
      if (exists) {
        skipped++;
        continue;
      }

      await Lead.create(cleanLead);
      inserted++;
    }

    res.json({
      message: `✅ Sheet Sync Complete`,
      inserted,
      skipped
    });
  } catch (error) {
    console.error("❌ Google Sheet Sync Error:", error);
    res.status(500).json({ message: "Google Sheet sync failed" });
  }
};