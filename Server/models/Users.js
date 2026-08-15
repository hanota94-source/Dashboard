import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "اسم المستخدم مطلوب"],
      unique: true, // يمنع تكرار اسم المستخدم
      trim: true, // يزيل المسافات الزائدة من البداية والنهاية
      minlength: [3, "يجب أن يتكون اسم المستخدم من 3 حروف على الأقل"],
      maxlength: [30, "لا يمكن أن يتجاوز اسم المستخدم 30 حرفاً"],
    },
    email: {
      type: String,
      required: false, // يمكنك تغييره لـ true إذا كنت تجمع البريد الإلكتروني
      unique: true,
      sparse: true, // لضمان عدم وجود أخطاء تكرار إذا كان البريد اختيارياً
      trim: true,
      lowercase: true, // تحويل البريد دائماً لأحرف صغيرة
    },
    pass: {
      type: String,
      required: [true],
      minlength: [6],
    },
    role: {
      type: String,
      enum: ["user", "admin"], // لتحديد صلاحيات المستخدم
      default: "user",
    },
  },
  {
    timestamps: true, // يضيف تلقائياً حقلين: createdAt (تاريخ الإنشاء) و updatedAt (تاريخ التحديث)
  },
);

// إنشاء النموذج (Model)
const User = mongoose.model("User", userSchema);

export default User;
