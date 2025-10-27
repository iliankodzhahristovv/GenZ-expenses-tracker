"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ProtectedLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCurrentUser } from "@/hooks/auth";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "sonner";
import { updateUserProfileAction } from "@/actions/users";
import { getUserCategoriesAction, saveUserCategoriesAction } from "@/actions/categories";
import { DEFAULT_CATEGORIES } from "@/lib/default-categories";

type SettingsTab = 
  | "profile" | "display" | "notifications" | "security"
  | "general" | "members" | "preferences" | "institutions"
  | "categories" | "merchants" | "rules" | "tags"
  | "data" | "billing" | "referrals";

/**
 * Settings Page
 * 
 * Protected page - requires authentication
 */
export default function SettingsPage() {
  const { user, refetch } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [fullName, setFullName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSavingCurrency, setIsSavingCurrency] = useState(false);
  const [currency, setCurrency] = useState(user?.currency || "Dollar");
  
  // Create/Edit Category Dialog State
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [categoryIcon, setCategoryIcon] = useState("❓");
  const [categoryName, setCategoryName] = useState("");
  const [categoryGroup, setCategoryGroup] = useState("Auto & Transport");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [isDeleteCategoryConfirmOpen, setIsDeleteCategoryConfirmOpen] = useState(false);
  const emojiInputRef = useRef<HTMLInputElement>(null);

  // Categories state - storing all categories by group
  const [categories, setCategories] = useState<Record<string, Array<{ id: string; icon: string; name: string }>>>(DEFAULT_CATEGORIES);
  const [isSavingCategories, setIsSavingCategories] = useState(false);

  // Clear selection when dialog opens
  useEffect(() => {
    if (isCreateCategoryOpen && emojiInputRef.current) {
      setTimeout(() => {
        emojiInputRef.current?.blur();
      }, 0);
    }
  }, [isCreateCategoryOpen]);

  // Load user categories from database on mount
  useEffect(() => {
    const loadCategories = async () => {
      const response = await getUserCategoriesAction();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    };

    loadCategories();
  }, []);

  // Save categories to database whenever they change
  const saveCategories = useCallback(async (categoriesToSave: typeof categories) => {
    setIsSavingCategories(true);
    try {
      await saveUserCategoriesAction(categoriesToSave);
    } catch (error) {
      console.error("Error saving categories:", error);
      toast.error("Failed to save categories");
    } finally {
      setIsSavingCategories(false);
    }
  }, []);
  
  // Create/Edit Group Dialog State
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupBudget, setGroupBudget] = useState("By category");
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [originalGroupName, setOriginalGroupName] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const accountMenuItems = [
    { id: "profile" as SettingsTab, label: "Profile" },
  ];

  const householdMenuItems = [
    { id: "general" as SettingsTab, label: "Currency" },
    { id: "categories" as SettingsTab, label: "Categories" },
  ];

  const handleUpdateProfile = async () => {
    if (!fullName.trim() && !user?.displayName) {
      toast.error("Full Name is required", {
        description: "Please enter your full name.",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const nameToUpdate = fullName.trim() || user?.displayName || "";
      const response = await updateUserProfileAction({ displayName: nameToUpdate });
      
      if (response.success) {
        toast.success("Profile updated", {
          description: "Your profile has been updated successfully.",
        });
        // Refresh user data
        refetch();
      } else {
        toast.error("Update failed", {
          description: response.error || "Failed to update profile.",
        });
      }
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error("Update failed", {
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveCurrency = async () => {
    setIsSavingCurrency(true);
    try {
      const response = await updateUserProfileAction({ currency });
      
      if (response.success) {
        toast.success("Currency updated", {
          description: `Currency has been set to ${currency}.`,
        });
        // Refresh user data
        refetch();
      } else {
        toast.error("Update failed", {
          description: response.error || "Failed to update currency.",
        });
      }
    } catch (error) {
      console.error("Update currency error:", error);
      toast.error("Update failed", {
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsSavingCurrency(false);
    }
  };

  const handleCreateCategory = () => {
    if (!categoryName.trim()) {
      toast.error("Category name is required", {
        description: "Please enter a name for the category.",
      });
      return;
    }

    let updatedCategories;

    if (editingCategoryId) {
      // Update existing category in state
      updatedCategories = {
        ...categories,
        [categoryGroup]: categories[categoryGroup].map((cat) =>
          cat.id === editingCategoryId
            ? { ...cat, icon: categoryIcon, name: categoryName.trim() }
            : cat
        ),
      };

      setCategories(updatedCategories);
      saveCategories(updatedCategories);

      toast.success("Category updated", {
        description: `${categoryIcon} ${categoryName} has been updated.`,
      });
    } else {
      // Create new category and add to state
      const newCategory = {
        id: `custom-${Date.now()}`,
        icon: categoryIcon,
        name: categoryName.trim(),
      };

      updatedCategories = {
        ...categories,
        [categoryGroup]: [...(categories[categoryGroup] || []), newCategory],
      };

      setCategories(updatedCategories);
      saveCategories(updatedCategories);

      toast.success("Category created", {
        description: `${categoryIcon} ${categoryName} has been added to ${categoryGroup}.`,
      });
    }

    // Reset form and close dialog
    setIsCreateCategoryOpen(false);
    setCategoryIcon("❓");
    setCategoryName("");
    setCategoryGroup("Auto & Transport");
    setEditingCategoryId(null);
  };

  const openEditCategory = (categoryId: string, icon: string, name: string, group: string) => {
    setEditingCategoryId(categoryId);
    setCategoryIcon(icon);
    setCategoryName(name);
    setCategoryGroup(group);
    setIsCreateCategoryOpen(true);
  };

  const handleDeleteCategory = () => {
    if (editingCategoryId && categoryGroup) {
      // Remove category from state
      const updatedCategories = {
        ...categories,
        [categoryGroup]: categories[categoryGroup].filter((cat) => cat.id !== editingCategoryId),
      };

      setCategories(updatedCategories);
      saveCategories(updatedCategories);

      toast.success("Category deleted", {
        description: `${categoryIcon} ${categoryName} has been deleted.`,
      });
    }

    // Reset form and close dialogs
    setIsDeleteCategoryConfirmOpen(false);
    setIsCreateCategoryOpen(false);
    setCategoryIcon("❓");
    setCategoryName("");
    setCategoryGroup("Auto & Transport");
    setEditingCategoryId(null);
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      toast.error("Group name is required", {
        description: "Please enter a name for the group.",
      });
      return;
    }

    let updatedCategories;

    if (editingGroupId && originalGroupName) {
      // Update existing group (rename if name changed)
      const trimmedNewName = groupName.trim();
      
      if (trimmedNewName !== originalGroupName) {
        // Rename group by creating new entry and deleting old one
        const newCategories = { ...categories };
        // Copy categories to new group name
        newCategories[trimmedNewName] = categories[originalGroupName] || [];
        // Delete old group
        delete newCategories[originalGroupName];
        updatedCategories = newCategories;
        
        setCategories(updatedCategories);
        saveCategories(updatedCategories);
      }

      toast.success("Group updated", {
        description: `${trimmedNewName} has been updated.`,
      });
    } else {
      // Create new group
      const trimmedNewName = groupName.trim();
      
      updatedCategories = {
        ...categories,
        [trimmedNewName]: [],
      };

      setCategories(updatedCategories);
      saveCategories(updatedCategories);

      toast.success("Group created", {
        description: `${trimmedNewName} has been created.`,
      });
    }

    // Reset form and close dialog
    setIsCreateGroupOpen(false);
    setGroupName("");
    setGroupBudget("By category");
    setEditingGroupId(null);
    setOriginalGroupName(null);
  };

  const openEditGroup = (groupId: string, name: string, budget: string) => {
    setEditingGroupId(groupId);
    setGroupName(name);
    setOriginalGroupName(name);
    setGroupBudget(budget);
    setIsCreateGroupOpen(true);
  };

  const handleDeleteGroup = () => {
    if (groupName) {
      // Remove group from categories state
      const newCategories = { ...categories };
      delete newCategories[groupName];

      setCategories(newCategories);
      saveCategories(newCategories);

      toast.success("Group deleted", {
        description: `${groupName} and all its categories have been deleted.`,
      });
    }

    // Reset form and close dialogs
    setIsDeleteConfirmOpen(false);
    setIsCreateGroupOpen(false);
    setGroupName("");
    setGroupBudget("By category");
    setEditingGroupId(null);
  };

  return (
    <ProtectedLayout>
      <Toaster />
      <div className="min-h-screen bg-[#F7F7F7] p-8">
        {/* Main Content */}
        <div className="flex gap-6 items-start">
          {/* Left Sidebar */}
          <div className="w-80 flex-shrink-0 space-y-6">
            {/* Account Section */}
            <Card>
              <CardHeader className="pb-1 border-b border-gray-100">
                <CardTitle className="text-base font-semibold">Account</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {accountMenuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full text-left px-6 py-2 text-sm transition-colors ${
                      activeTab === item.id
                        ? "bg-cyan-50 text-gray-900 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* General Section */}
            <Card>
              <CardHeader className="pb-1 border-b border-gray-100">
                <CardTitle className="text-base font-semibold">General</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {householdMenuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full text-left px-6 py-2 text-sm transition-colors ${
                      activeTab === item.id
                        ? "bg-cyan-50 text-gray-900 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Content Area */}
          <div className="flex-1">
            {activeTab === "profile" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xl font-semibold">
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </div>
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    defaultValue={user?.displayName || ""}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-gray-50 cursor-not-allowed"
                  />
                </div>

                {/* Update Button */}
                <Button 
                  className="w-full bg-black hover:bg-gray-800 text-white"
                  onClick={handleUpdateProfile}
                  disabled={isUpdating}
                >
                  {isUpdating ? "Updating..." : "Update Profile"}
                </Button>
              </CardContent>
            </Card>
            )}

            {activeTab === "general" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Currency</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Currency Selection */}
                  <div className="space-y-2 mb-8">
                    <Label htmlFor="currency">Select Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dollar">Dollar (USD)</SelectItem>
                        <SelectItem value="Euro">Euro (EUR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Save Button */}
                  <Button 
                    className="w-full bg-black hover:bg-gray-800 text-white"
                    onClick={handleSaveCurrency}
                    disabled={isSavingCurrency}
                  >
                    {isSavingCurrency ? "Saving..." : "Save Currency"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeTab === "categories" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">Categories</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Info Banner */}
                    <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4 border border-blue-100">
                      <div className="flex-shrink-0 mt-0.5">
                        <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-sm text-blue-700">
                        Changes you make to your groups and categories here will be applied all throughout Sidequest. You should customize your category structure to fit your needs.
                      </p>
                    </div>

                    {/* Expenses Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Expenses</h3>
                        <Button 
                          variant="link" 
                          className="text-blue-600 hover:text-blue-700 p-0 h-auto"
                          onClick={() => setIsCreateGroupOpen(true)}
                        >
                          Create group
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {/* Dynamically render all category groups */}
                        {Object.keys(categories).sort((a, b) => a.localeCompare(b)).map((groupName) => (
                          <div key={groupName} className="rounded-lg border border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                              <span className="font-medium">{groupName}</span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-gray-600 hover:text-gray-900"
                                onClick={() => openEditGroup(groupName.toLowerCase().replace(/\s+&\s+/g, '-').replace(/\s+/g, '-'), groupName, "By category")}
                              >
                                Edit
                              </Button>
                            </div>
                            <div className="divide-y divide-gray-200">
                              {categories[groupName]
                                ?.sort((a, b) => a.name.localeCompare(b.name))
                                .map((category) => (
                                  <div
                                    key={category.id}
                                    className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 cursor-pointer"
                                    onClick={() => openEditCategory(category.id, category.icon, category.name, groupName)}
                                  >
                                    <span className="text-lg bg-transparent">{category.icon}</span>
                                    <span className="text-sm">{category.name}</span>
                                  </div>
                                ))}
                            </div>
                            <div className="px-4 py-3 border-t border-gray-200">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-gray-600 hover:text-gray-900" 
                                onClick={() => { setCategoryGroup(groupName); setIsCreateCategoryOpen(true); }}
                              >
                                Create Category
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Category Dialog */}
      <Dialog open={isCreateCategoryOpen} onOpenChange={setIsCreateCategoryOpen}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader className="flex flex-row items-center justify-between pr-6">
            <DialogTitle className="text-xl font-semibold">
              {editingCategoryId ? "Edit Category" : "Create Category"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Icon & Name */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Icon & Name</Label>
              <div className="flex items-center gap-2">
                <Input
                  ref={emojiInputRef}
                  type="text"
                  value={categoryIcon}
                  onChange={(e) => setCategoryIcon(e.target.value)}
                  className="w-16 text-center text-2xl bg-white selection:bg-blue-100 selection:text-gray-900"
                  maxLength={2}
                  autoFocus={false}
                />
                <Input
                  type="text"
                  placeholder="New Category"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Group */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Group</Label>
              <Select value={categoryGroup} onValueChange={setCategoryGroup}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Auto & Transport">Auto & Transport</SelectItem>
                  <SelectItem value="Housing">Housing</SelectItem>
                  <SelectItem value="Bills & Utilities">Bills & Utilities</SelectItem>
                  <SelectItem value="Food & Dining">Food & Dining</SelectItem>
                  <SelectItem value="Travel & Lifestyle">Travel & Lifestyle</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Buttons */}
            <div className="flex justify-between pt-2">
              {editingCategoryId ? (
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleteCategoryConfirmOpen(true)}
                  className="px-6"
                >
                  Delete Category
                </Button>
              ) : (
                <div />
              )}
              <Button
                onClick={handleCreateCategory}
                className="bg-black hover:bg-gray-800 text-white px-6"
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation Dialog */}
      <Dialog open={isDeleteCategoryConfirmOpen} onOpenChange={setIsDeleteCategoryConfirmOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Delete Category?</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete &quot;{categoryIcon} {categoryName}&quot;? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteCategoryConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteCategory}
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Group Dialog */}
      <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader className="flex flex-row items-center justify-between pr-6">
            <DialogTitle className="text-xl font-semibold">
              {editingGroupId ? "Edit Group" : "Create Group"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Name</Label>
              <Input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
              />
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Budget</Label>
              <Select value={groupBudget} onValueChange={setGroupBudget}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="By category">By category</SelectItem>
                  <SelectItem value="Fixed amount">Fixed amount</SelectItem>
                  <SelectItem value="No budget">No budget</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Buttons */}
            <div className="flex justify-between pt-2">
              {editingGroupId ? (
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  className="px-6"
                >
                  Delete Group
                </Button>
              ) : (
                <div />
              )}
              <Button
                onClick={handleCreateGroup}
                className="bg-black hover:bg-gray-800 text-white px-6"
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Delete Group?</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete &quot;{groupName}&quot;? This action cannot be undone and will remove all categories within this group.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteGroup}
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ProtectedLayout>
  );
}

