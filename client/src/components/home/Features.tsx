import {
  LightbulbIcon,
  BriefcaseIcon,
  UsersIcon,
} from "lucide-react";

export function Features() {
  const features = [
    {
      icon: LightbulbIcon,
      title: "Build Problem-Solving Skills",
      description:
        "Sharpen your algorithmic thinking through regular coding challenges and team competitions.",
      iconBgClass: "bg-blue-100 dark:bg-blue-900/30",
      iconTextClass: "text-primary",
    },
    {
      icon: BriefcaseIcon,
      title: "Interview Preparation",
      description:
        "Get ready for technical interviews with mock sessions and expert feedback from industry professionals.",
      iconBgClass: "bg-green-100 dark:bg-green-900/30",
      iconTextClass: "text-secondary",
    },
    {
      icon: UsersIcon,
      title: "Network with Peers",
      description:
        "Connect with like-minded students and professionals passionate about data structures and algorithms.",
      iconBgClass: "bg-purple-100 dark:bg-purple-900/30",
      iconTextClass: "text-accent",
    },
  ];

  return (
    <section className="py-12 md:py-16 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Join Our Club?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div
                className={`w-12 h-12 ${feature.iconBgClass} rounded-full flex items-center justify-center mb-4`}
              >
                <feature.icon
                  className={`h-6 w-6 ${feature.iconTextClass}`}
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
