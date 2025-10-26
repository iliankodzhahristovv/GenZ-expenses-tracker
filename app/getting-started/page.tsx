"use client";

import { useState, useEffect } from "react";
import { ProtectedLayout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Users, ListChecks, Calendar } from "lucide-react";

interface Task {
  id: number;
  title: string;
  description: string;
  buttonText: string;
  icon: React.ReactNode;
  storageKey: string;
}

const tasks: Task[] = [
  {
    id: 1,
    title: "Tell us about your company",
    description: "Please describe your company to us in as much detail as possible so that we can set up your account in the best possible way. We'd love to know how long your business has been operating, the specific services or products you provide, the size of your team, and any other relevant information that helps us understand your operations better. Feel free to include details about your company's mission, target audience, and any unique aspects that make your business stand out. The more context you provide, the better we can tailor the account to meet your needs.",
    buttonText: "Share Company Info",
    icon: <span className="text-xl">🏢</span>,
    storageKey: "task_1_completed",
  },
  {
    id: 2,
    title: "Set up your Audience(ICP) filters",
    description: "Create multiple filters based on your ideal customer criteria (a.k.a. Audience) - think location, job position, company size, you name it. You can test multiple Audiences at the same time to see what works best for you.",
    buttonText: "Create an Audience",
    icon: <Users className="h-5 w-5 text-gray-400" />,
    storageKey: "task_2_completed",
  },
  {
    id: 3,
    title: "Review your potential customers and create a List",
    description: "Mix your Audience filters with Agents to get live lists of potential customers. You'll see all their signals in one place, making it super easy to pick who to reach out to first. Save those filter configurations in Lists so you can monitor your best prospects over time.",
    buttonText: "Create a List",
    icon: <ListChecks className="h-5 w-5 text-gray-400" />,
    storageKey: "task_3_completed",
  },
  {
    id: 4,
    title: "Schedule your Onboarding Call",
    description: "Book a call directly with our founders to get the most out of the platform. They'll personally show you some hidden tweaks that can seriously boost your performance - stuff you won't find anywhere else.",
    buttonText: "Schedule a Call",
    icon: <Calendar className="h-5 w-5 text-gray-400" />,
    storageKey: "task_4_completed",
  },
];

/**
 * Getting Started Page
 * 
 * Protected page - requires authentication
 */
export default function GettingStartedPage() {
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load completion status from localStorage
    const loadedStatus: Record<string, boolean> = {};
    tasks.forEach((task) => {
      const isCompleted = localStorage.getItem(task.storageKey) === "true";
      loadedStatus[task.storageKey] = isCompleted;
    });
    setCompletedTasks(loadedStatus);
  }, []);

  const handleTaskComplete = (task: Task) => {
    // Mark task as completed
    localStorage.setItem(task.storageKey, "true");
    setCompletedTasks((prev) => ({
      ...prev,
      [task.storageKey]: true,
    }));
  };

  if (!mounted) {
    return null;
  }

  return (
    <ProtectedLayout>
      <div className="p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {tasks.map((task) => {
            const isCompleted = completedTasks[task.storageKey] || false;
            
            return (
              <Card key={task.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {isCompleted ? (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white flex-shrink-0 mt-0.5">
                          <Check className="h-4 w-4" />
                        </div>
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-900 flex-shrink-0 mt-0.5">
                          <span className="text-sm font-medium">{task.id}</span>
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg font-semibold mb-6">
                          {task.title}
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600 mb-6">
                          {task.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50">
                      {task.icon}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="ml-9">
                    <Button 
                      onClick={() => handleTaskComplete(task)}
                      disabled={isCompleted}
                      className="bg-black hover:bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCompleted ? "Completed" : task.buttonText}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </ProtectedLayout>
  );
}

