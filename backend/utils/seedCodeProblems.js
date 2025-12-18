import CodeProblem from "../models/CodeProblem.js";

const sampleProblems = [
    {
        title: "Two Sum",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
        difficulty: "Easy",
        category: "Array",
        tags: ["array", "hash-table"],
        timeLimit: 1000,
        memoryLimit: 256,
        example: {
            input: "nums = [2,7,11,15], target = 9",
            output: "[0,1]",
            explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
        },
        testCases: [
            { input: "[2,7,11,15]\n9", expectedOutput: "[0,1]" },
            { input: "[3,2,4]\n6", expectedOutput: "[1,2]" },
            { input: "[3,3]\n6", expectedOutput: "[0,1]" }
        ],
        templates: {
            javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Write your solution here
    
};`,
            python: `def two_sum(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: List[int]
    """
    # Write your solution here
    pass`,
            java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        
    }
}`,
            cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here
        
    }
};`
        },
        hints: [
            "Try using a hash map to store the numbers you've seen so far.",
            "For each number, check if target - number exists in your hash map."
        ]
    },
    {
        title: "Reverse String",
        description: "Write a function that reverses a string. The input string is given as an array of characters s. You must do this by modifying the input array in-place with O(1) extra memory.",
        difficulty: "Easy",
        category: "String",
        tags: ["string", "two-pointers"],
        timeLimit: 1000,
        memoryLimit: 256,
        example: {
            input: 's = ["h","e","l","l","o"]',
            output: '["o","l","l","e","h"]',
            explanation: "Reverse the array of characters in-place."
        },
        testCases: [
            { input: '["h","e","l","l","o"]', expectedOutput: '["o","l","l","e","h"]' },
            { input: '["H","a","n","n","a","h"]', expectedOutput: '["h","a","n","n","a","H"]' }
        ],
        templates: {
            javascript: `/**
 * @param {character[]} s
 * @return {void} Do not return anything, modify s in-place instead.
 */
var reverseString = function(s) {
    // Write your solution here
    
};`,
            python: `def reverse_string(s):
    """
    :type s: List[str]
    :rtype: None Do not return anything, modify s in-place instead.
    """
    # Write your solution here
    pass`,
            java: `class Solution {
    public void reverseString(char[] s) {
        // Write your solution here
        
    }
}`,
            cpp: `class Solution {
public:
    void reverseString(vector<char>& s) {
        // Write your solution here
        
    }
};`
        },
        hints: [
            "Use two pointers, one at the beginning and one at the end.",
            "Swap characters and move pointers towards each other."
        ]
    },
    {
        title: "Valid Parentheses",
        description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets. Open brackets must be closed in the correct order.",
        difficulty: "Easy",
        category: "Stack",
        tags: ["string", "stack"],
        timeLimit: 1000,
        memoryLimit: 256,
        example: {
            input: 's = "()"',
            output: 'true',
            explanation: "The string contains valid parentheses."
        },
        testCases: [
            { input: '"()"', expectedOutput: 'true' },
            { input: '"()[]{}"', expectedOutput: 'true' },
            { input: '"(]"', expectedOutput: 'false' },
            { input: '"([)]"', expectedOutput: 'false' },
            { input: '"{[]}"', expectedOutput: 'true' }
        ],
        templates: {
            javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function(s) {
    // Write your solution here
    
};`,
            python: `def is_valid(s):
    """
    :type s: str
    :rtype: bool
    """
    # Write your solution here
    pass`,
            java: `class Solution {
    public boolean isValid(String s) {
        // Write your solution here
        
    }
}`,
            cpp: `class Solution {
public:
    bool isValid(string s) {
        // Write your solution here
        
    }
};`
        },
        hints: [
            "Use a stack to keep track of opening brackets.",
            "When you encounter a closing bracket, check if it matches the most recent opening bracket."
        ]
    },
    {
        title: "Longest Substring Without Repeating Characters",
        description: "Given a string s, find the length of the longest substring without repeating characters.",
        difficulty: "Medium",
        category: "String",
        tags: ["string", "sliding-window", "hash-table"],
        timeLimit: 2000,
        memoryLimit: 256,
        example: {
            input: 's = "abcabcbb"',
            output: '3',
            explanation: 'The answer is "abc", with the length of 3.'
        },
        testCases: [
            { input: '"abcabcbb"', expectedOutput: '3' },
            { input: '"bbbbb"', expectedOutput: '1' },
            { input: '"pwwkew"', expectedOutput: '3' },
            { input: '""', expectedOutput: '0' }
        ],
        templates: {
            javascript: `/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function(s) {
    // Write your solution here
    
};`,
            python: `def length_of_longest_substring(s):
    """
    :type s: str
    :rtype: int
    """
    # Write your solution here
    pass`,
            java: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        // Write your solution here
        
    }
}`,
            cpp: `class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        // Write your solution here
        
    }
};`
        },
        hints: [
            "Use the sliding window technique with two pointers.",
            "Keep track of characters you've seen using a hash set or hash map."
        ]
    },
    {
        title: "Merge Two Sorted Lists",
        description: "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists in a one sorted list. The list should be made by splicing together the nodes of the first two lists. Return the head of the merged linked list.",
        difficulty: "Easy",
        category: "Linked List",
        tags: ["linked-list", "recursion"],
        timeLimit: 1000,
        memoryLimit: 256,
        example: {
            input: 'list1 = [1,2,4], list2 = [1,3,4]',
            output: '[1,1,2,3,4,4]',
            explanation: "Merge the two sorted linked lists."
        },
        testCases: [
            { input: '[1,2,4]\n[1,3,4]', expectedOutput: '[1,1,2,3,4,4]' },
            { input: '[]\n[]', expectedOutput: '[]' },
            { input: '[]\n[0]', expectedOutput: '[0]' }
        ],
        templates: {
            javascript: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} list1
 * @param {ListNode} list2
 * @return {ListNode}
 */
var mergeTwoLists = function(list1, list2) {
    // Write your solution here
    
};`,
            python: `# Definition for singly-linked list.
# class ListNode(object):
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
def merge_two_lists(list1, list2):
    """
    :type list1: ListNode
    :type list2: ListNode
    :rtype: ListNode
    """
    # Write your solution here
    pass`,
            java: `/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */
class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        // Write your solution here
        
    }
}`,
            cpp: `/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */
class Solution {
public:
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
        // Write your solution here
        
    }
};`
        },
        hints: [
            "Use a dummy node to simplify the merging process.",
            "Compare the values of the current nodes and choose the smaller one."
        ]
    },
    {
        title: "Maximum Subarray",
        description: "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum. A subarray is a contiguous part of an array.",
        difficulty: "Medium",
        category: "Dynamic Programming",
        tags: ["array", "dynamic-programming", "divide-and-conquer"],
        timeLimit: 2000,
        memoryLimit: 256,
        example: {
            input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
            output: '6',
            explanation: '[4,-1,2,1] has the largest sum = 6.'
        },
        testCases: [
            { input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6' },
            { input: '[1]', expectedOutput: '1' },
            { input: '[5,4,-1,7,8]', expectedOutput: '23' }
        ],
        templates: {
            javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
var maxSubArray = function(nums) {
    // Write your solution here
    
};`,
            python: `def max_sub_array(nums):
    """
    :type nums: List[int]
    :rtype: int
    """
    # Write your solution here
    pass`,
            java: `class Solution {
    public int maxSubArray(int[] nums) {
        // Write your solution here
        
    }
}`,
            cpp: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        // Write your solution here
        
    }
};`
        },
        hints: [
            "Try using Kadane's algorithm.",
            "Keep track of the maximum sum ending at each position."
        ]
    }
];

export const seedCodeProblems = async () => {
    try {
        // Clear existing problems
        await CodeProblem.deleteMany({});

        // Insert sample problems
        await CodeProblem.insertMany(sampleProblems);

        console.log("✅ Code problems seeded successfully");
    } catch (error) {
        console.error("❌ Error seeding code problems:", error);
    }
};

export default seedCodeProblems;