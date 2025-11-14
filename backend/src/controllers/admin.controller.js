import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';

// Get dashboard stats
export const getDashboardStatsController = async (req, res) => {
  const [userCount, projectCount, users, projects] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        accountType: true,
        createdAt: true,
      },
    }),
    prisma.project.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
  ]);

  res.json({
    data: {
      stats: {
        userCount,
        projectCount,
      },
      recentUsers: users,
      recentProjects: projects,
    },
  });
};

// Get all users
export const getUsersController = async (req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      address: true,
      gender: true,
      level: true,
      accountType: true,
      verified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.json({ data: users });
};

// Create user
export const createUserController = async (req, res) => {
  const {
    email,
    password,
    firstName,
    lastName,
    phoneNumber,
    address,
    gender,
    level,
    dailyRate,
    accountType,
  } = req.body;

  // Validation
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({
      error: {
        message: 'กรุณากรอกข้อมูลที่จำเป็น',
        code: 'VALIDATION_ERROR',
      },
    });
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(400).json({
      error: {
        message: 'อีเมลนี้ถูกใช้งานแล้ว',
        code: 'EMAIL_EXISTS',
      },
    });
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
      phoneNumber,
      address,
      gender,
      level,
      dailyRate: dailyRate ? parseFloat(dailyRate) : null,
      accountType: accountType || 'EMPLOYEE',
      verified: true, // Admin-created users are auto-verified
    },
    select: {
      id: true,
      email: true,
      name: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      address: true,
      gender: true,
      level: true,
      accountType: true,
      verified: true,
      createdAt: true,
    },
  });

  res.status(201).json({ data: user });
};

// Update user
export const updateUserController = async (req, res) => {
  const { id } = req.params;
  const {
    email,
    password,
    firstName,
    lastName,
    phoneNumber,
    address,
    gender,
    level,
    dailyRate,
    accountType,
  } = req.body;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({ where: { id } });
  if (!existingUser) {
    return res.status(404).json({
      error: {
        message: 'ไม่พบผู้ใช้',
        code: 'USER_NOT_FOUND',
      },
    });
  }

  // Check email uniqueness if changed
  if (email && email !== existingUser.email) {
    const emailTaken = await prisma.user.findUnique({ where: { email } });
    if (emailTaken) {
      return res.status(400).json({
        error: {
          message: 'อีเมลนี้ถูกใช้งานแล้ว',
          code: 'EMAIL_EXISTS',
        },
      });
    }
  }

  // Prepare update data
  const updateData = {
    email,
    firstName,
    lastName,
    phoneNumber,
    address,
    gender,
    level,
    dailyRate: dailyRate ? parseFloat(dailyRate) : undefined,
    accountType,
  };

  // Update name if firstName or lastName changed
  if (firstName || lastName) {
    updateData.name = `${firstName || existingUser.firstName} ${lastName || existingUser.lastName}`;
  }

  // Hash new password if provided
  if (password) {
    updateData.passwordHash = await bcrypt.hash(password, 12);
  }

  // Update user
  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      address: true,
      gender: true,
      level: true,
      accountType: true,
      verified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.json({ data: user });
};

// Delete user
export const deleteUserController = async (req, res) => {
  const { id } = req.params;

  // Prevent self-deletion
  if (req.user.id === id) {
    return res.status(400).json({
      error: {
        message: 'ไม่สามารถลบบัญชีของตัวเองได้',
        code: 'CANNOT_DELETE_SELF',
      },
    });
  }

  // Check if user exists
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return res.status(404).json({
      error: {
        message: 'ไม่พบผู้ใช้',
        code: 'USER_NOT_FOUND',
      },
    });
  }

  // Delete user
  await prisma.user.delete({ where: { id } });

  res.json({ data: { message: 'ลบผู้ใช้สำเร็จ' } });
};

// ==================== PROJECT MANAGEMENT ====================

// Get all projects
export const getProjectsController = async (req, res) => {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      assignments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  res.json({ data: projects });
};

// Create project
export const createProjectController = async (req, res) => {
  const { name, description, startDate, endDate, internalCost, status } = req.body;

  // Validation
  if (!name) {
    return res.status(400).json({
      error: {
        message: 'กรุณากรอกชื่อโปรเจกต์',
        code: 'VALIDATION_ERROR',
      },
    });
  }

  // Validate dates
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      return res.status(400).json({
        error: {
          message: 'วันสิ้นสุดต้องมาหลังวันเริ่มต้น',
          code: 'INVALID_DATE_RANGE',
        },
      });
    }
  }

  // Create project
  const project = await prisma.project.create({
    data: {
      name,
      description,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      internalCost: internalCost ? parseFloat(internalCost) : null,
      status: status || 'ACTIVE',
      creatorId: req.user.id,
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      assignments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  res.status(201).json({ data: project });
};

// Update project
export const updateProjectController = async (req, res) => {
  const { id } = req.params;
  const { name, description, startDate, endDate, internalCost, status } = req.body;

  // Check if project exists
  const existingProject = await prisma.project.findUnique({ where: { id } });
  if (!existingProject) {
    return res.status(404).json({
      error: {
        message: 'ไม่พบโปรเจกต์',
        code: 'PROJECT_NOT_FOUND',
      },
    });
  }

  // Validate dates
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      return res.status(400).json({
        error: {
          message: 'วันสิ้นสุดต้องมาหลังวันเริ่มต้น',
          code: 'INVALID_DATE_RANGE',
        },
      });
    }
  }

  // Update project
  const project = await prisma.project.update({
    where: { id },
    data: {
      name,
      description,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      internalCost: internalCost ? parseFloat(internalCost) : undefined,
      status,
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      assignments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  res.json({ data: project });
};

// Delete project
export const deleteProjectController = async (req, res) => {
  const { id } = req.params;

  // Check if project exists
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    return res.status(404).json({
      error: {
        message: 'ไม่พบโปรเจกต์',
        code: 'PROJECT_NOT_FOUND',
      },
    });
  }

  // Delete project (assignments will be deleted automatically due to cascade)
  await prisma.project.delete({ where: { id } });

  res.json({ data: { message: 'ลบโปรเจกต์สำเร็จ' } });
};

// Get project assignments
export const getProjectAssignmentsController = async (req, res) => {
  const { id } = req.params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      assignments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              firstName: true,
              lastName: true,
              dailyRate: true,
            },
          },
        },
        orderBy: { assignedAt: 'desc' },
      },
    },
  });

  if (!project) {
    return res.status(404).json({
      error: {
        message: 'ไม่พบโปรเจกต์',
        code: 'PROJECT_NOT_FOUND',
      },
    });
  }

  // Calculate budget info
  const internalCost = project.internalCost || 0;
  const totalSpent = project.assignments.reduce((sum, a) => sum + (a.totalCost || 0), 0);
  const remainingBudget = internalCost - totalSpent;

  res.json({
    data: {
      assignments: project.assignments,
      budget: {
        total: internalCost,
        spent: totalSpent,
        remaining: remainingBudget,
        percentage: internalCost > 0 ? (totalSpent / internalCost) * 100 : 0,
      },
    },
  });
};

// Assign user to project
export const assignUserToProjectController = async (req, res) => {
  const { id } = req.params;
  const { userId, workDays } = req.body;

  if (!userId) {
    return res.status(400).json({
      error: {
        message: 'กรุณาเลือกผู้ใช้',
        code: 'VALIDATION_ERROR',
      },
    });
  }

  if (!workDays || workDays < 1) {
    return res.status(400).json({
      error: {
        message: 'กรุณาระบุจำนวนวันทำงาน',
        code: 'VALIDATION_ERROR',
      },
    });
  }

  // Check if project exists
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      assignments: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!project) {
    return res.status(404).json({
      error: {
        message: 'ไม่พบโปรเจกต์',
        code: 'PROJECT_NOT_FOUND',
      },
    });
  }

  // Check if user exists
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return res.status(404).json({
      error: {
        message: 'ไม่พบผู้ใช้',
        code: 'USER_NOT_FOUND',
      },
    });
  }

  // Get daily rate from user (from dailyRate field or level field)
  let dailyRate = user.dailyRate;

  // ถ้าไม่มี dailyRate ลองใช้จาก level
  if (!dailyRate || dailyRate <= 0) {
    if (user.level) {
      const levelAsNumber = parseFloat(user.level);
      if (!isNaN(levelAsNumber) && levelAsNumber > 0) {
        dailyRate = levelAsNumber;
      }
    }
  }

  // Check if we have a valid rate
  if (!dailyRate || dailyRate <= 0) {
    return res.status(400).json({
      error: {
        message: 'ผู้ใช้นี้ยังไม่มีค่าจ้างต่อวัน กรุณาตั้งค่า dailyRate หรือ level (เป็นตัวเลข) ก่อน',
        code: 'NO_DAILY_RATE',
      },
    });
  }

  // Check if already assigned
  const existingAssignment = await prisma.projectAssignment.findUnique({
    where: {
      projectId_userId: {
        projectId: id,
        userId: userId,
      },
    },
  });

  if (existingAssignment) {
    return res.status(400).json({
      error: {
        message: 'ผู้ใช้นี้ถูก assign ไปแล้ว',
        code: 'ALREADY_ASSIGNED',
      },
    });
  }

  // Calculate cost
  const totalCost = dailyRate * workDays;

  // Calculate current spent budget
  const currentSpent = project.assignments.reduce((sum, assignment) => {
    return sum + (assignment.totalCost || 0);
  }, 0);

  // Check if budget is sufficient
  const internalCost = project.internalCost || 0;
  const remainingBudget = internalCost - currentSpent;

  if (totalCost > remainingBudget) {
    return res.status(400).json({
      error: {
        message: `งบประมาณไม่เพียงพอ (เหลือ ${remainingBudget.toLocaleString()} บาท, ต้องการ ${totalCost.toLocaleString()} บาท)`,
        code: 'INSUFFICIENT_BUDGET',
        details: {
          remainingBudget,
          requiredBudget: totalCost,
          shortage: totalCost - remainingBudget,
        },
      },
    });
  }

  // Create assignment
  const assignment = await prisma.projectAssignment.create({
    data: {
      projectId: id,
      userId: userId,
      workDays: parseInt(workDays),
      dailyRate: dailyRate,
      totalCost: totalCost,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          firstName: true,
          lastName: true,
          dailyRate: true,
        },
      },
    },
  });

  res.status(201).json({ data: assignment });
};

// Unassign user from project
export const unassignUserFromProjectController = async (req, res) => {
  const { id, userId } = req.params;

  // Check if assignment exists
  const assignment = await prisma.projectAssignment.findUnique({
    where: {
      projectId_userId: {
        projectId: id,
        userId: userId,
      },
    },
  });

  if (!assignment) {
    return res.status(404).json({
      error: {
        message: 'ไม่พบการ assign นี้',
        code: 'ASSIGNMENT_NOT_FOUND',
      },
    });
  }

  // Delete assignment
  await prisma.projectAssignment.delete({
    where: {
      projectId_userId: {
        projectId: id,
        userId: userId,
      },
    },
  });

  res.json({ data: { message: 'ยกเลิกการ assign สำเร็จ' } });
};

// ==================== EXCEL IMPORT/EXPORT ====================

import XLSX from 'xlsx';

// Download Excel template
export const downloadProjectTemplateController = async (req, res) => {
  try {
    // Create workbook
    const wb = XLSX.utils.book_new();

    // Sample data
    const sampleData = [
      {
        'Project Name': 'Website Redesign',
        'Description': 'Redesign company website',
        'Start Date': '2024-01-01',
        'End Date': '2024-06-30',
        'Internal Cost': 500000,
        'Status': 'ACTIVE',
      },
      {
        'Project Name': 'Mobile App Development',
        'Description': 'Build iOS and Android app',
        'Start Date': '2024-02-01',
        'End Date': '2024-12-31',
        'Internal Cost': 1000000,
        'Status': 'ACTIVE',
      },
    ];

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(sampleData);

    // Set column widths
    ws['!cols'] = [
      { wch: 30 }, // Project Name
      { wch: 40 }, // Description
      { wch: 12 }, // Start Date
      { wch: 12 }, // End Date
      { wch: 15 }, // Internal Cost
      { wch: 10 }, // Status
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Projects');

    // Add instructions sheet
    const instructions = [
      { Field: 'Project Name', Required: 'Yes', Format: 'Text', Example: 'Website Redesign' },
      { Field: 'Description', Required: 'No', Format: 'Text', Example: 'Project description' },
      { Field: 'Start Date', Required: 'No', Format: 'YYYY-MM-DD', Example: '2024-01-01' },
      { Field: 'End Date', Required: 'No', Format: 'YYYY-MM-DD', Example: '2024-12-31' },
      { Field: 'Internal Cost', Required: 'No', Format: 'Number', Example: '500000' },
      { Field: 'Status', Required: 'No', Format: 'ACTIVE/LOCKED/EXPIRED', Example: 'ACTIVE' },
    ];

    const wsInstructions = XLSX.utils.json_to_sheet(instructions);
    wsInstructions['!cols'] = [{ wch: 20 }, { wch: 10 }, { wch: 20 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Set headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=project-template.xlsx');

    res.send(buffer);
  } catch (error) {
    console.error('Error generating template:', error);
    res.status(500).json({
      error: {
        message: 'ไม่สามารถสร้าง template ได้',
        code: 'TEMPLATE_ERROR',
      },
    });
  }
};

// Upload and import projects from Excel
export const uploadProjectsController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: {
          message: 'กรุณาอัพโหลดไฟล์ Excel',
          code: 'NO_FILE',
        },
      });
    }

    // Parse Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return res.status(400).json({
        error: {
          message: 'ไฟล์ Excel ว่างเปล่า',
          code: 'EMPTY_FILE',
        },
      });
    }

    const results = {
      success: [],
      errors: [],
    };

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2; // Excel row number (1-indexed + header)

      try {
        // Validate required fields
        if (!row['Project Name']) {
          results.errors.push({
            row: rowNumber,
            error: 'Project Name is required',
          });
          continue;
        }

        // Parse dates
        let startDate = null;
        let endDate = null;

        if (row['Start Date']) {
          startDate = new Date(row['Start Date']);
          if (isNaN(startDate.getTime())) {
            results.errors.push({
              row: rowNumber,
              error: 'Invalid Start Date format',
            });
            continue;
          }
        }

        if (row['End Date']) {
          endDate = new Date(row['End Date']);
          if (isNaN(endDate.getTime())) {
            results.errors.push({
              row: rowNumber,
              error: 'Invalid End Date format',
            });
            continue;
          }
        }

        // Validate dates
        if (startDate && endDate && endDate <= startDate) {
          results.errors.push({
            row: rowNumber,
            error: 'End Date must be after Start Date',
          });
          continue;
        }

        // Parse status
        let status = 'ACTIVE';
        if (row['Status']) {
          const statusUpper = row['Status'].toString().toUpperCase();
          if (['ACTIVE', 'LOCKED', 'EXPIRED'].includes(statusUpper)) {
            status = statusUpper;
          }
        }

        // Parse internal cost
        let internalCost = null;
        if (row['Internal Cost']) {
          internalCost = parseFloat(row['Internal Cost']);
          if (isNaN(internalCost)) {
            internalCost = null;
          }
        }

        // Create project
        const project = await prisma.project.create({
          data: {
            name: row['Project Name'].toString(),
            description: row['Description'] ? row['Description'].toString() : null,
            startDate,
            endDate,
            internalCost,
            status,
            creatorId: req.user.id,
          },
        });

        results.success.push({
          row: rowNumber,
          projectId: project.id,
          name: project.name,
        });
      } catch (error) {
        results.errors.push({
          row: rowNumber,
          error: error.message,
        });
      }
    }

    res.json({
      data: {
        total: data.length,
        successCount: results.success.length,
        errorCount: results.errors.length,
        results,
      },
    });
  } catch (error) {
    console.error('Error uploading projects:', error);
    res.status(500).json({
      error: {
        message: 'ไม่สามารถอัพโหลดไฟล์ได้',
        code: 'UPLOAD_ERROR',
        details: error.message,
      },
    });
  }
};
