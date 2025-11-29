// Sample data for demonstration
import { type Note, type Category } from '../lib/types';

// Hierarchical category structure
export const sampleCategories: Category[] = [
    // Programming
    {
        id: 'programming',
        path: 'programming',
        description: 'Software development and programming topics'
    },
    {
        id: 'programming-languages',
        path: 'programming/languages',
        description: 'Programming languages and syntax'
    },
    {
        id: 'programming-languages-javascript',
        path: 'programming/languages/javascript',
        description: 'JavaScript language and ecosystem'
    },
    {
        id: 'programming-languages-python',
        path: 'programming/languages/python',
        description: 'Python language and libraries'
    },
    {
        id: 'programming-languages-rust',
        path: 'programming/languages/rust',
        description: 'Rust systems programming language'
    },
    {
        id: 'programming-frontend',
        path: 'programming/frontend',
        description: 'Frontend development and technologies'
    },
    {
        id: 'programming-frontend-react',
        path: 'programming/frontend/react',
        description: 'React library and ecosystem'
    },
    {
        id: 'programming-frontend-css',
        path: 'programming/frontend/css',
        description: 'CSS styling and layout'
    },
    {
        id: 'programming-backend',
        path: 'programming/backend',
        description: 'Backend development and server technologies'
    },
    {
        id: 'programming-backend-nodejs',
        path: 'programming/backend/nodejs',
        description: 'Node.js runtime and development'
    },
    {
        id: 'programming-backend-api',
        path: 'programming/backend/api',
        description: 'REST APIs and web services'
    },
    {
        id: 'programming-devops',
        path: 'programming/devops',
        description: 'DevOps practices and tools'
    },
    {
        id: 'programming-devops-docker',
        path: 'programming/devops/docker',
        description: 'Containerization with Docker'
    },

    // Career
    {
        id: 'career',
        path: 'career',
        description: 'Professional development and career growth'
    },
    {
        id: 'career-growth',
        path: 'career/growth',
        description: 'Career advancement and skill development'
    },
    {
        id: 'career-growth-skills',
        path: 'career/growth/skills',
        description: 'Technical and soft skills development'
    },
    {
        id: 'career-growth-networking',
        path: 'career/growth/networking',
        description: 'Professional networking and relationships'
    },
    {
        id: 'career-learning',
        path: 'career/learning',
        description: 'Educational resources and learning strategies'
    },
    {
        id: 'career-learning-courses',
        path: 'career/learning/courses',
        description: 'Online courses and bootcamps'
    },
    {
        id: 'career-learning-books',
        path: 'career/learning/books',
        description: 'Technical books and reading materials'
    },

    // Work
    {
        id: 'work',
        path: 'work',
        description: 'Work processes and productivity'
    },
    {
        id: 'work-remote',
        path: 'work/remote',
        description: 'Remote work practices and tools'
    },
    {
        id: 'work-remote-productivity',
        path: 'work/remote/productivity',
        description: 'Remote work productivity tips'
    },
    {
        id: 'work-collaboration',
        path: 'work/collaboration',
        description: 'Team collaboration and communication'
    },
    {
        id: 'work-collaboration-pair-programming',
        path: 'work/collaboration/pair-programming',
        description: 'Collaborative coding practices'
    },
    {
        id: 'work-collaboration-code-review',
        path: 'work/collaboration/code-review',
        description: 'Code review processes and best practices'
    }
];

export const sampleNotes: Note[] = [
    {
        id: '1',
        title: "My First React Project",
        content: "Just finished building my first React application! It's a simple todo list but I learned so much about components, state, and props. The feeling of seeing your code come to life in the browser is amazing.",
        image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=200&fit=crop",
        createdAt: "2025-08-15T10:30:00Z",
        categories: ["programming/frontend/react", "programming/languages/javascript", "career/learning"],
        reviews: [
            {
                id: '1',
                author: "CodeMaster",
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
                comment: "Great start! Keep practicing and you'll be building complex apps in no time.",
                createdAt: "2025-08-15T11:15:00Z",
                rating: 4,
                zapAmount: 3,
                votes: [
                    {
                        id: '1',
                        eventID: '1',
                        author: "DevEnthusiast",
                        amount: 1,
                        comment: "I agree! React is such a powerful library.",
                        createdAt: 1
                    },
                    {
                        id: '2',
                        eventID: '1',
                        author: "FrontendDev",
                        amount: 2,
                        createdAt: 1
                    },
                    {
                        id: '3',
                        eventID: '1',
                        author: "CriticUser",
                        amount: 1,
                        comment: "While this is encouraging, I think beginners should focus on fundamentals first before diving into frameworks.",
                        createdAt: 1
                    },
                    {
                        id: '4',
                        eventID: '1',
                        author: "ReactFan",
                        amount: 3,
                        comment: "Great advice! Building projects is the best way to learn.",
                        createdAt: 1
                    }
                ]
            },
            {
                id: '2',
                author: "ReactFan",
                avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face",
                comment: "I remember my first React project too. The learning curve is worth it!",
                createdAt: "2025-08-15T12:30:00Z",
                rating: 5,
                zapAmount: 2,
                votes: [
                    {
                        id: '5',
                        eventID: '1',
                        author: "WebDev2023",
                        amount: 2,
                        comment: "React has an amazing ecosystem!",
                        createdAt: 1
                    },
                    {
                        id: '6',
                        eventID: '1',
                        author: "CodeNewbie",
                        amount: 1,
                        createdAt: 1
                    }
                ]
            }
        ]
    },
    {
        id: '2',
        title: "Tips for Learning JavaScript",
        content: "After months of studying JavaScript, here are my top 3 tips: 1) Practice coding every day, even if it's just 30 minutes. 2) Build projects, don't just follow tutorials. 3) Don't be afraid to break things - debugging teaches you more than you think!",
        image: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=200&fit=crop",
        createdAt: "2025-08-14T15:45:00Z",
        categories: ["programming/languages/javascript", "career/learning"],
        reviews: [
            {
                id: '3',
                author: "LearnerBee",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
                comment: "This is exactly what I needed to hear. Thank you for the motivation!",
                createdAt: "2025-08-14T16:20:00Z",
                rating: 5,
                zapAmount: 12,
                votes: [
                    {
                        id: '7',
                        eventID: '1',
                        author: "MotivatedCoder",
                        amount: 3,
                        comment: "These tips are gold! Saving this for later.",
                        createdAt: 1
                    },
                    {
                        id: '8',
                        eventID: '1',
                        author: "StudyBuddy",
                        amount: 2,
                        createdAt: 1
                    },
                    {
                        id: '9',
                        eventID: '1',
                        author: "CodeJourney",
                        amount: 1,
                        comment: "Motivation is key!",
                        createdAt: 1
                    }
                ]
            },
            {
                id: '4',
                author: "DevGuru",
                avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
                comment: "Solid advice! I'd add: read other people's code to see different approaches.",
                createdAt: "2025-08-14T17:45:00Z",
                rating: 4,
                zapAmount: 4,
                votes: [
                    {
                        id: '10',
                        eventID: '1',
                        author: "OpenSourceFan",
                        amount: 5,
                        comment: "Reading open source code taught me so much!",
                        createdAt: 1
                    },
                    {
                        id: '11',
                        eventID: '1',
                        author: "LearnByExample",
                        amount: 3,
                        createdAt: 1
                    }
                ]
            },
            {
                id: '5',
                author: "NewCoder",
                avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
                comment: "The debugging tip is so true! I've learned more from fixing my mistakes than from tutorials.",
                createdAt: "2025-08-14T19:10:00Z",
                rating: 3,
                zapAmount: 5,
                votes: [
                    {
                        id: '31',
                        eventID: '1',
                        author: "DebugMaster",
                        amount: 2,
                        comment: "Debugging is the best teacher!",
                        createdAt: 1
                    },
                    {
                        id: '32',
                        eventID: '1',
                        author: "ErrorHunter",
                        amount: 1,
                        createdAt: 1
                    }
                ]
            },
            {
                id: '9',
                author: "CodeMentor",
                avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=40&h=40&fit=crop&crop=face",
                comment: "Great tips! I would also recommend joining coding communities and participating in code challenges.",
                createdAt: "2025-08-14T20:30:00Z",
                rating: 5,
                zapAmount: 3,
                votes: [
                    {
                        id: '33',
                        eventID: '1',
                        author: "CommunityBuilder",
                        amount: 4,
                        comment: "Coding communities are invaluable for growth!",
                        createdAt: 1
                    },
                    {
                        id: '34',
                        eventID: '1',
                        author: "ChallengeSeeker",
                        amount: 2,
                        createdAt: 1
                    }
                ]
            },
            {
                id: '10',
                author: "PythonFan",
                avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face",
                comment: "This applies to any programming language. I started with Python and these tips helped me a lot!",
                createdAt: "2025-08-14T21:15:00Z",
                rating: 1,
                zapAmount: 7,
                votes: [
                    {
                        id: '35',
                        eventID: '1',
                        author: "PolyglotProgrammer",
                        amount: 3,
                        comment: "Universal advice that works across all languages!",
                        createdAt: 1
                    }
                ]
            },
            {
                id: '11',
                author: "WebDevNinja",
                avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&crop=face",
                comment: "Point #2 is crucial. Building projects taught me more than any course ever did.",
                createdAt: "2025-08-15T08:45:00Z",
                rating: 5,
                zapAmount: 99,
                votes: [
                    {
                        id: '36',
                        eventID: '1',
                        author: "ProjectBased",
                        amount: 15,
                        comment: "Projects are where theory meets practice!",
                        createdAt: 1
                    },
                    {
                        id: '37',
                        eventID: '1',
                        author: "PracticalLearner",
                        amount: 10,
                        createdAt: 1
                    }
                ]
            },
            {
                id: '12',
                author: "StudentCoder",
                avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face",
                comment: "I'm still struggling with point #3. Breaking things scares me but I guess that's part of learning.",
                createdAt: "2025-08-15T09:20:00Z",
                rating: 3,
                zapAmount: 56,
                votes: [
                    {
                        id: '38',
                        eventID: '1',
                        author: "MistakeMaker",
                        amount: 8,
                        comment: "Fear of breaking things held me back for years. Embrace the errors!",
                        createdAt: 1
                    },
                    {
                        id: '39',
                        eventID: '1',
                        author: "GrowthMindset",
                        amount: 5,
                        comment: "Every error is a learning opportunity!",
                        createdAt: 1
                    }
                ]
            }
        ]
    },
    {
        id: '3',
        title: "Why I Love Open Source",
        content: "Contributing to open source projects has changed my career. Not only have I improved my coding skills, but I've also connected with amazing developers worldwide. If you're hesitant to contribute, start small - even fixing typos in documentation helps!",
        image: "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400&h=200&fit=crop",
        createdAt: "2025-08-13T09:20:00Z",
        categories: ["career/growth", "programming"],
        reviews: [
            {
                id: '6',
                author: "FirstTimer",
                avatar: "https://images.unsplash.com/photo-1522556189639-b150ed9c4330?w=40&h=40&fit=crop&crop=face",
                comment: "I made my first contribution last week thanks to posts like this. The community is so welcoming!",
                createdAt: "2025-08-13T10:45:00Z",
                rating: 3,
                zapAmount: 61,
                votes: [
                    {
                        id: '12',
                        eventID: '1',
                        author: "OpenSourceAdvocate",
                        amount: 10,
                        comment: "Welcome to the open source community! Every contribution matters.",
                        createdAt: 1
                    },
                    {
                        id: '13',
                        eventID: '1',
                        author: "Maintainer",
                        amount: 8,
                        comment: "We love seeing new contributors!",
                        createdAt: 1
                    },
                    {
                        id: '14',
                        eventID: '1',
                        author: "ContributorPro",
                        amount: 5,
                        createdAt: 1
                    }
                ]
            }
        ]
    },
    {
        id: '4',
        title: "Mobile-First CSS is a Game Changer",
        content: "I used to design for desktop first, then try to make it work on mobile. Big mistake! Starting with mobile-first CSS has made my responsive designs so much cleaner and my code more maintainable.",
        image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=200&fit=crop",
        createdAt: "2025-08-12T14:10:00Z",
        categories: ["programming/frontend/css", "programming/frontend"],
        reviews: []
    },
    {
        id: '5',
        title: "The Art of Code Reviews",
        content: "Good code reviews aren't just about finding bugs - they're about knowledge sharing, maintaining code quality, and building team culture. Always be constructive, ask questions instead of making demands, and remember that everyone's learning.",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop",
        createdAt: "2025-08-11T11:00:00Z",
        categories: ["work/collaboration/code-review", "work/collaboration"],
        reviews: [
            {
                id: '7',
                author: "JuniorDev",
                avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=40&h=40&fit=crop&crop=face",
                comment: "As someone new to code reviews, this perspective is really helpful. Thank you!",
                createdAt: "2025-08-11T12:30:00Z",
                rating: 5,
                zapAmount: 2,
                votes: [
                    {
                        id: '15',
                        eventID: '1',
                        author: "ReviewExpert",
                        amount: 4,
                        comment: "Code reviews are where real learning happens!",
                        createdAt: 1
                    },
                    {
                        id: '16',
                        eventID: '1',
                        author: "TeamLead",
                        amount: 2,
                        createdAt: 1
                    }
                ]
            },
            {
                id: '8',
                author: "SeniorDev",
                avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=40&h=40&fit=crop&crop=face",
                comment: "Couldn't agree more. Code reviews are as much about mentoring as they are about code quality.",
                createdAt: "2025-08-11T14:15:00Z",
                rating: 4,
                zapAmount: 2,
                votes: [
                    {
                        id: '17',
                        eventID: '1',
                        author: "MentoringMatters",
                        amount: 6,
                        comment: "Mentoring through code reviews builds strong teams.",
                        createdAt: 1
                    },
                    {
                        id: '18',
                        eventID: '1',
                        author: "QualityFirst",
                        amount: 3,
                        createdAt: 1
                    },
                    {
                        id: '19',
                        eventID: '1',
                        author: "CodeQuality",
                        amount: 1,
                        createdAt: 1
                    }
                ]
            }
        ]
    },
    {
        id: '6',
        title: "My Journey from Bootcamp to Senior Developer",
        content: "Three years ago I was a complete beginner at a coding bootcamp. Today I'm a senior developer at a tech startup. The journey wasn't easy - lots of imposter syndrome, failed interviews, and late nights debugging. But persistence pays off. Keep coding, keep learning, and don't give up on your dreams!",
        image: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=400&h=200&fit=crop",
        createdAt: "2025-08-10T16:30:00Z",
        categories: ["career/growth", "career/learning/courses"],
        reviews: [
            {
                id: '13',
                author: "BootcampGrad",
                avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face",
                comment: "This gives me so much hope! I just graduated from bootcamp and feeling overwhelmed. Thank you for sharing!",
                createdAt: "2025-08-10T17:15:00Z",
                rating: 3,
                zapAmount: 7,
                votes: [
                    {
                        id: '40',
                        eventID: '1',
                        author: "SeniorMentor",
                        amount: 6,
                        comment: "You got this! The beginning is always the hardest.",
                        createdAt: 1
                    },
                    {
                        id: '41',
                        eventID: '1',
                        author: "FormerBootcamper",
                        amount: 4,
                        createdAt: 1
                    }
                ]
            },
            {
                id: '14',
                author: "CareerChanger",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
                comment: "I'm 35 and considering a career change to tech. Stories like this inspire me to take the leap!",
                createdAt: "2025-08-10T18:30:00Z",
                rating: 2,
                zapAmount: 77,
                votes: [
                    {
                        id: '42',
                        eventID: '1',
                        author: "LateStarter",
                        amount: 12,
                        comment: "It's never too late! I switched at 40 and love it.",
                        createdAt: 1
                    },
                    {
                        id: '43',
                        eventID: '1',
                        author: "CareerPivot",
                        amount: 9,
                        comment: "Age is just a number. Your life experience is an asset!",
                        createdAt: 1
                    }
                ]
            },
            {
                id: '15',
                author: "TechRecruiter",
                avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
                comment: "As a recruiter, I love seeing bootcamp grads succeed. Your journey proves that passion matters more than pedigree.",
                createdAt: "2025-08-10T19:45:00Z",
                rating: 3,
                zapAmount: 111,
                votes: [
                    {
                        id: '44',
                        eventID: '1',
                        author: "HiringManager",
                        amount: 20,
                        comment: "We hire based on skills and attitude, not just degrees!",
                        createdAt: 1
                    },
                    {
                        id: '45',
                        eventID: '1',
                        author: "TalentScout",
                        amount: 15,
                        createdAt: 1
                    }
                ]
            }
        ]
    },
    {
        id: '7',
        title: "Docker Containers Simplified",
        content: "Docker seemed like magic until I understood the basics. Think of containers like shipping containers - they package your app with everything it needs to run, making deployment consistent across environments. Start with simple Dockerfiles and gradually build complexity.",
        createdAt: "2025-08-09T13:45:00Z",
        categories: ["programming/devops/docker", "programming/devops"],
        reviews: [
            {
                id: '16',
                author: "CloudNewbie",
                avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=40&h=40&fit=crop&crop=face",
                comment: "The shipping container analogy finally made Docker click for me. Thank you!",
                createdAt: "2025-08-09T14:20:00Z",
                rating: 4,
                zapAmount: 2,
                votes: [
                    {
                        id: '20',
                        eventID: '1',
                        author: "DockerPro",
                        amount: 4,
                        comment: "Great analogy! It really helps visualize containerization.",
                        createdAt: 1
                    },
                    {
                        id: '21',
                        eventID: '1',
                        author: "DevOpsGuru",
                        amount: 2,
                        createdAt: 1
                    }
                ]
            },
            {
                id: '17',
                author: "K8sExpert",
                avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
                comment: "Great introduction! Once you master Docker, Kubernetes becomes much easier to understand.",
                createdAt: "2025-08-09T15:45:00Z",
                rating: 5,
                zapAmount: 4,
                votes: [
                    {
                        id: '22',
                        eventID: '1',
                        author: "K8sLearner",
                        amount: 5,
                        comment: "Learning Docker first was the best decision!",
                        createdAt: 1
                    }
                ]
            }
        ]
    },
    {
        id: '8',
        title: "Why I Switched from Python to Rust",
        content: "After 5 years with Python, I decided to learn Rust for systems programming. The learning curve is steep, but the performance gains and memory safety are incredible. The compiler is strict but helpful - it catches bugs before they become problems in production.",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop",
        createdAt: "2025-08-08T10:15:00Z",
        categories: ["programming/languages/rust", "programming/languages/python"],
        reviews: [
            {
                id: '18',
                author: "PythonLover",
                avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face",
                comment: "Interesting perspective! I love Python's simplicity, but I'm curious about Rust's performance benefits.",
                createdAt: "2025-08-08T11:30:00Z",
                rating: 5,
                zapAmount: 14,
                votes: [
                    {
                        id: '23',
                        eventID: '1',
                        author: "PerformanceMatters",
                        amount: 7,
                        comment: "Rust's zero-cost abstractions are incredible for performance-critical apps.",
                        createdAt: 1
                    },
                    {
                        id: '24',
                        eventID: '1',
                        author: "MultiLangDev",
                        amount: 4,
                        comment: "Both languages are great! Use the right tool for the job.",
                        createdAt: 1
                    }
                ]
            },
            {
                id: '19',
                author: "SystemsProgrammer",
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
                comment: "Rust's ownership model is brilliant once you get it. It eliminates entire classes of bugs!",
                createdAt: "2025-08-08T13:15:00Z",
                rating: 4,
                zapAmount: 8,
                votes: [
                    {
                        id: '25',
                        eventID: '1',
                        author: "MemorySafety",
                        amount: 6,
                        comment: "No more null pointer exceptions or memory leaks!",
                        createdAt: 1
                    },
                    {
                        id: '26',
                        eventID: '1',
                        author: "RustConvert",
                        amount: 3,
                        createdAt: 1
                    }
                ]
            }
        ]
    },
    {
        id: '9',
        title: "Building My First API with Node.js",
        content: "Just deployed my first REST API using Express.js! It's a simple blog API with CRUD operations, but seeing it work with a real database feels amazing. Next step: adding authentication and maybe switching to GraphQL.",
        image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=200&fit=crop",
        createdAt: "2025-08-07T20:30:00Z",
        categories: ["programming/backend/nodejs", "programming/backend/api"],
        reviews: [
            {
                id: '20',
                author: "FullStackDev",
                avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&crop=face",
                comment: "Congrats! For authentication, I'd recommend starting with JWT tokens. Keep it simple at first.",
                createdAt: "2025-08-07T21:15:00Z",
                rating: 1,
                zapAmount: 10,
                votes: [
                    {
                        id: '27',
                        eventID: '1',
                        author: "SecurityFirst",
                        amount: 8,
                        comment: "JWT is great, but remember to store tokens securely!",
                        createdAt: 1
                    },
                    {
                        id: '28',
                        eventID: '1',
                        author: "AuthExpert",
                        amount: 5,
                        comment: "Also consider OAuth2 for third-party authentication.",
                        createdAt: 1
                    }
                ]
            },
            {
                id: '21',
                author: "GraphQLFan",
                avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face",
                comment: "GraphQL is great but master REST first. Understanding HTTP fundamentals will serve you well!",
                createdAt: "2025-08-07T22:30:00Z",
                rating: 5,
                zapAmount: 1,
                votes: [
                    {
                        id: '29',
                        eventID: '1',
                        author: "RESTfulAPI",
                        amount: 3,
                        comment: "REST principles apply to all API design!",
                        createdAt: 1
                    },
                    {
                        id: '30',
                        eventID: '1',
                        author: "BackendDev",
                        amount: 2,
                        createdAt: 1
                    }
                ]
            }
        ]
    },
    {
        id: '10',
        title: "The Beauty of Functional Programming",
        content: "Learning functional programming concepts like immutability, pure functions, and higher-order functions has made me a better developer in any language. Even if you're not using a functional language, these concepts improve code quality and reduce bugs.",
        createdAt: "2025-08-06T12:00:00Z",
        categories: ["programming", "career/learning"],
        reviews: [
            {
                id: '22',
                author: "OOP_Developer",
                avatar: "https://images.unsplash.com/photo-1522556189639-b150ed9c4330?w=40&h=40&fit=crop&crop=face",
                comment: "I'm primarily an OOP developer, but I've started incorporating FP concepts. The immutability principle is game-changing!",
                createdAt: "2025-08-06T13:20:00Z",
                rating: 2,
                zapAmount: 1,
                votes: [
                    {
                        id: '46',
                        eventID: '1',
                        author: "FPAdvocate",
                        amount: 3,
                        comment: "Immutability makes debugging so much easier!",
                        createdAt: 1
                    },
                    {
                        id: '47',
                        eventID: '1',
                        author: "HybridApproach",
                        amount: 2,
                        createdAt: 1
                    }
                ]
            },
            {
                id: '23',
                author: "HaskellGuru",
                avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=40&h=40&fit=crop&crop=face",
                comment: "Exactly! FP isn't about the language, it's about the mindset. These principles make any code better.",
                createdAt: "2025-08-06T14:45:00Z",
                rating: 5,
                zapAmount: 1,
                votes: [
                    {
                        id: '48',
                        eventID: '1',
                        author: "FunctionalFirst",
                        amount: 4,
                        comment: "Mindset over syntax!",
                        createdAt: 1
                    }
                ]
            }
        ]
    },
    {
        id: '11',
        title: "Remote Work Tips for Developers",
        content: "Working remotely for 2 years taught me valuable lessons: 1) Set clear boundaries between work and personal time. 2) Invest in good ergonomics. 3) Over-communicate with your team. 4) Take breaks and go outside! 5) Create a dedicated workspace, even if it's just a corner of your room.",
        createdAt: "2025-08-05T14:20:00Z",
        categories: ["work/remote", "work/remote/productivity"],
        reviews: [
            {
                id: '24',
                author: "DigitalNomad",
                avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=40&h=40&fit=crop&crop=face",
                comment: "Point #4 is so important! I used to code for 12 hours straight. Now I take regular walks and I'm more productive.",
                createdAt: "2025-08-01T14:00:00.000Z",

                rating: 4,
                zapAmount: 1,
                votes: [
                    {
                        id: '49',
                        eventID: '1',
                        author: "HealthFirst",
                        amount: 3,
                        comment: "Physical health directly impacts code quality!",
                        createdAt: 1
                    },
                    {
                        id: '50',
                        eventID: '1',
                        author: "WorkLifeBalance",
                        amount: 2,
                        createdAt: 1
                    }
                ]
            },
            {
                id: '25',
                author: "NewRemoteWorker",
                avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face",
                comment: "Just started remote work last month. The workspace tip is crucial - it really helps with mental separation.",
                createdAt: "2025-08-01T19:00:00.000Z",

                rating: 5,
                zapAmount: 1,
                votes: [
                    {
                        id: '51',
                        eventID: '1',
                        author: "HomeOfficeExpert",
                        amount: 4,
                        comment: "Dedicated workspace changed everything for me!",
                        createdAt: 1
                    }
                ]

            },
            {
                id: '26',
                author: "TeamManager",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
                comment: "As a manager of remote developers, I appreciate when team members over-communicate. It makes everything smoother!",
                createdAt: "2025-08-02T00:00:00.000Z",
                rating: 5,
                zapAmount: 1,
                votes: [
                    {
                        id: '52',
                        eventID: '1',
                        author: "RemoteTeamLead",
                        amount: 5,
                        comment: "Over-communication is better than under-communication in remote work!",
                        createdAt: 1
                    },
                    {
                        id: '53',
                        eventID: '1',
                        author: "AsyncCommunicator",
                        amount: 3,
                        createdAt: 1
                    }
                ]
            }
        ]
    },
    {
        id: '12',
        title: "Machine Learning Isn't Just for Experts",
        content: "You don't need a PhD to start with machine learning! I built my first image classifier using TensorFlow.js in just a weekend. Start with pre-trained models, understand the basics, then gradually dive deeper. The ecosystem has never been more beginner-friendly.",
        image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=200&fit=crop",
        createdAt: "2025-08-04T09:30:00Z",
        categories: ["programming", "career/learning"],
        reviews: [
            {
                id: '27',
                author: "MathPhobic",
                avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
                comment: "I've been intimidated by the math requirements, but maybe I should just start building and learn as I go?",
                createdAt: "2025-08-02T03:00:00.000Z",
                rating: 1,
                zapAmount: 1,
                votes: [
                    {
                        id: '54',
                        eventID: '1',
                        author: "MLPractitioner",
                        amount: 2,
                        comment: "Start with high-level libraries, the math will make sense as you go!",
                        createdAt: 1
                    }
                ]
            },
            {
                id: '28',
                author: "DataScientist",
                avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=40&h=40&fit=crop&crop=face",
                comment: "Absolutely right! Tools like AutoML and pre-trained models democratize AI. Understanding comes with practice.",
                createdAt: "2025-08-02T09:00:00.000Z",
                rating: 5,
                zapAmount: 1,
                votes: [
                    {
                        id: '55',
                        eventID: '1',
                        author: "AIEnthusiast",
                        amount: 3,
                        comment: "AutoML tools are amazing for getting started quickly!",
                        createdAt: 1
                    },
                    {
                        id: '56',
                        eventID: '1',
                        author: "TransferLearning",
                        amount: 2,
                        createdAt: 1
                    }
                ]

            }
        ]
    },
    {
        id: '13',
        title: "Why I Love Pair Programming",
        content: "Pair programming isn't just about code quality - it's about knowledge sharing, instant feedback, and building team cohesion. Yes, it can feel slow at first, but the collective problem-solving and reduced bugs make it worthwhile. Plus, it's a great way to onboard new team members!",
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=200&fit=crop",
        createdAt: "2025-08-03T11:45:00Z",
        categories: ["work/collaboration/pair-programming", "work/collaboration"],
        reviews: [
            {
                id: '29',
                author: "SoloDevForever",
                avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
                comment: "I used to hate pair programming, but after trying it properly, I see the benefits. Still prefer solo for deep work though.",
                createdAt: "2025-08-02T15:00:00.000Z",
                rating: 1,
                zapAmount: 1,
                votes: [
                    {
                        id: '57',
                        eventID: '1',
                        author: "FlowState",
                        amount: 2,
                        comment: "Balance is key - pair for complex problems, solo for deep focus.",
                        createdAt: 1
                    }
                ]

            },
            {
                id: '30',
                author: "AgileCertified",
                avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face",
                comment: "Pair programming is essential for complex problems. Two minds really are better than one!",
                createdAt: "2025-08-02T19:00:00.000Z",
                rating: 5,
                zapAmount: 1,
                votes: [
                    {
                        id: '58',
                        eventID: '1',
                        author: "TeamCollaboration",
                        amount: 3,
                        comment: "Collaboration unlocks solutions you'd never find alone!",
                        createdAt: 1
                    },
                    {
                        id: '59',
                        eventID: '1',
                        author: "PairProgrammingFan",
                        amount: 2,
                        createdAt: 1
                    }
                ]

            }
        ]
    },
    {
        id: '14',
        title: "CSS Grid vs Flexbox: When to Use What",
        content: "Confused about when to use CSS Grid vs Flexbox? Here's my rule of thumb: Use Flexbox for one-dimensional layouts (rows OR columns). Use CSS Grid for two-dimensional layouts (rows AND columns). Both are powerful, and you'll often use them together in the same project!",
        createdAt: "2025-08-02T15:10:00Z",
        categories: ["programming/frontend/css", "programming/frontend"],
        reviews: [
            {
                id: '31',
                author: "LayoutNewbie",
                avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face",
                comment: "This one-dimensional vs two-dimensional explanation finally made it clear! Thank you so much!",
                createdAt: "2025-08-03T00:00:00.000Z",
                rating: 5,
                zapAmount: 1,
                votes: [
                    {
                        id: '60',
                        eventID: '1',
                        author: "CSSMentor",
                        amount: 4,
                        comment: "This analogy is perfect for teaching CSS layout!",
                        createdAt: 1
                    },
                    {
                        id: '61',
                        eventID: '1',
                        author: "LayoutExpert",
                        amount: 2,
                        createdAt: 1
                    }
                ]

            },
            {
                id: '32',
                author: "ResponsiveGuru",
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
                comment: "Great explanation! I'd add that Grid is also fantastic for responsive design without media queries.",
                createdAt: "2025-08-03T07:00:00.000Z",
                rating: 2,
                zapAmount: 1,
                votes: [
                    {
                        id: '62',
                        eventID: '1',
                        author: "ResponsiveDesigner",
                        amount: 3,
                        comment: "Auto-fit and minmax() are game changers!",
                        createdAt: 1
                    }
                ]

            }
        ]
    },
    {
        id: '15',
        title: "My Biggest Coding Mistake (And What I Learned)",
        content: "Last month I pushed code to production without proper testing and crashed our entire user dashboard for 3 hours. Embarrassing? Yes. But it taught me invaluable lessons about testing, staging environments, and the importance of code reviews. Mistakes are learning opportunities if you let them be.",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop",
        createdAt: "2025-08-01T08:20:00Z",
        categories: ["career/learning", "career/growth", "programming"],
        reviews: [
            {
                id: '33',
                author: "SeniorDev_Mike",
                avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=40&h=40&fit=crop&crop=face",
                comment: "We've all been there! The fact that you're sharing this shows real maturity. These lessons stick with you forever.",
                createdAt: "2025-08-03T12:00:00.000Z",
                rating: 1,
                zapAmount: 1,
                votes: [
                    {
                        id: '63',
                        eventID: '1',
                        author: "LearningFromMistakes",
                        amount: 2,
                        comment: "Transparency about mistakes helps everyone grow!",
                        createdAt: 1
                    }
                ]

            },
            {
                id: '34',
                author: "QA_Engineer",
                avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&crop=face",
                comment: "This is why we advocate for comprehensive testing! Glad you learned from it without anyone getting hurt.",
                createdAt: "2025-08-03T14:00:00.000Z",
                rating: 5,
                zapAmount: 1,
                votes: [
                    {
                        id: '64',
                        eventID: '1',
                        author: "TestingAdvocate",
                        amount: 5,
                        comment: "Testing saves production disasters!",
                        createdAt: 1
                    },
                    {
                        id: '65',
                        eventID: '1',
                        author: "QualityAssurance",
                        amount: 3,
                        createdAt: 1
                    }
                ]

            },
            {
                id: '35',
                author: "JuniorDeveloper",
                avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face",
                comment: "Thank you for sharing! As a junior dev, I'm terrified of making mistakes like this. Your perspective helps.Thank you for sharing! As a junior dev, I'm terrified of making mistakes like this. Your perspective helps.Thank you for sharing! As a junior dev, I'm terrified of making mistakes like this. Your perspective helps.Thank you for sharing! As a junior dev, I'm terrified of making mistakes like this. Your perspective helps.Thank you for sharing! As a junior dev, I'm terrified of making mistakes like this. Your perspective helps.Thank you for sharing! As a junior dev, I'm terrified of making mistakes like this. Your perspective helps.Thank you for sharing! As a junior dev, I'm terrified of making mistakes like this. Your perspective helps.Thank you for sharing! As a junior dev, I'm terrified of making mistakes like this. Your perspective helps.Thank you for sharing! As a junior dev, I'm terrified of making mistakes like this. Your perspective helps.Thank you for sharing! As a junior dev, I'm terrified of making mistakes like this. Your perspective helps.",
                createdAt: "2025-08-03T19:00:00.000Z",
                rating: 4,
                zapAmount: 1,
                votes: [
                    {
                        id: '66',
                        eventID: '1',
                        author: "MentorDev",
                        amount: 4,
                        comment: "Everyone makes mistakes. Learn from them and move forward!",
                        createdAt: 1
                    },
                    {
                        id: '67',
                        eventID: '1',
                        author: "SupportiveDev",
                        amount: 2,
                        createdAt: 1
                    }
                ]
            }
        ]
    }
];
