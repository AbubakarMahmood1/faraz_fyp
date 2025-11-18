"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthController from "@/api/AuthController";
import axios from "axios";
import { API_BASE_URL } from "@/api/api.config";
import { Button, Input, Select } from "rizzui";
import toast from "react-hot-toast";

interface User {
  userId: string;
  username: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  bio: string;
  expertise: string[];
  skills: string[];
  experienceLevel: string;
  city: string;
  country: string;
}

interface FilterOptions {
  roles: string[];
  expertise: string[];
  skills: string[];
  experienceLevels: string[];
  locations: Array<{ city: string; country: string; label: string }>;
  sortBy: Array<{ value: string; label: string }>;
}

export default function SearchPage() {
  const router = useRouter();

  // Search filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedExperienceLevel, setSelectedExperienceLevel] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Results and pagination
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Filter options
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    roles: [],
    expertise: [],
    skills: [],
    experienceLevels: [],
    locations: [],
    sortBy: [],
  });

  useEffect(() => {
    const token = AuthController.getSession();
    if (!token) {
      router.push("/signin");
      return;
    }

    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      const token = AuthController.getSession();
      const response = await axios.get(`${API_BASE_URL}/search/filter-options`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status === "success") {
        setFilterOptions(response.data.data);
      }
    } catch (error) {
      console.error("Failed to load filter options:", error);
      toast.error("Failed to load search filters");
    }
  };

  const handleSearch = async (page = 1) => {
    try {
      setIsLoading(true);
      const token = AuthController.getSession();

      // Build query params
      const params: any = {
        page,
        limit: 12,
        sortBy,
        sortOrder,
      };

      if (searchQuery) params.query = searchQuery;
      if (selectedRole) params.role = selectedRole;
      if (selectedExpertise.length > 0) params.expertise = selectedExpertise.join(",");
      if (selectedSkills.length > 0) params.skills = selectedSkills.join(",");
      if (selectedExperienceLevel) params.experienceLevel = selectedExperienceLevel;
      if (selectedLocation) {
        const locationParts = selectedLocation.split(", ");
        if (locationParts.length === 2) {
          params.city = locationParts[0];
          params.country = locationParts[1];
        }
      }

      const response = await axios.get(`${API_BASE_URL}/search/users`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      if (response.data.status === "success") {
        setUsers(response.data.data.users);
        setCurrentPage(response.data.data.page);
        setTotalPages(response.data.data.totalPages);
        setTotalResults(response.data.data.totalResults);
      }
    } catch (error: any) {
      console.error("Search error:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Search failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedRole("");
    setSelectedExpertise([]);
    setSelectedSkills([]);
    setSelectedExperienceLevel("");
    setSelectedLocation("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setUsers([]);
    setCurrentPage(1);
    setTotalPages(0);
    setTotalResults(0);
  };

  const toggleExpertise = (exp: string) => {
    if (selectedExpertise.includes(exp)) {
      setSelectedExpertise(selectedExpertise.filter((e) => e !== exp));
    } else {
      setSelectedExpertise([...selectedExpertise, exp]);
    }
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Search Users</h1>
          <p className="text-gray-600">
            Find innovators, experts, and investors in the platform
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>

          {/* Search Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by name or username
            </label>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter name or username..."
              className="w-full"
            />
          </div>

          {/* Role Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
            >
              <option value="">All Roles</option>
              {filterOptions.roles.map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Expertise Filter */}
          {filterOptions.expertise.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expertise ({selectedExpertise.length} selected)
              </label>
              <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                {filterOptions.expertise.map((exp) => (
                  <label key={exp} className="flex items-center gap-2 mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedExpertise.includes(exp)}
                      onChange={() => toggleExpertise(exp)}
                      className="rounded"
                    />
                    <span className="text-sm">{exp}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Skills Filter */}
          {filterOptions.skills.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills ({selectedSkills.length} selected)
              </label>
              <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                {filterOptions.skills.map((skill) => (
                  <label key={skill} className="flex items-center gap-2 mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSkills.includes(skill)}
                      onChange={() => toggleSkill(skill)}
                      className="rounded"
                    />
                    <span className="text-sm">{skill}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Experience Level Filter */}
          {filterOptions.experienceLevels.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level
              </label>
              <select
                value={selectedExperienceLevel}
                onChange={(e) => setSelectedExperienceLevel(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <option value="">All Levels</option>
                {filterOptions.experienceLevels.map((level) => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Location Filter */}
          {filterOptions.locations.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <option value="">All Locations</option>
                {filterOptions.locations.map((loc) => (
                  <option key={loc.label} value={loc.label}>
                    {loc.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sort By */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <div className="flex gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg p-2"
              >
                {filterOptions.sortBy.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-32 border border-gray-300 rounded-lg p-2"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={() => handleSearch(1)} className="flex-1" disabled={isLoading}>
              {isLoading ? "Searching..." : "Search"}
            </Button>
            <Button onClick={handleClearFilters} variant="outline" disabled={isLoading}>
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Results Section */}
        {users.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Search Results ({totalResults} total)
              </h2>
              <p className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </p>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <div
                  key={user.userId}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.firstName}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
                        {user.firstName?.[0] || "U"}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-lg">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-gray-600 capitalize">{user.role}</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">{user.bio}</p>

                  {user.experienceLevel && (
                    <p className="text-xs text-gray-600 mb-2">
                      <span className="font-medium">Experience:</span>{" "}
                      {user.experienceLevel.charAt(0).toUpperCase() +
                        user.experienceLevel.slice(1)}
                    </p>
                  )}

                  {user.city && user.country && (
                    <p className="text-xs text-gray-600 mb-3">
                      <span className="font-medium">Location:</span> {user.city},{" "}
                      {user.country}
                    </p>
                  )}

                  {user.expertise && user.expertise.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-gray-700 mb-1">Expertise:</p>
                      <div className="flex flex-wrap gap-1">
                        {user.expertise.slice(0, 3).map((exp, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                          >
                            {exp}
                          </span>
                        ))}
                        {user.expertise.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{user.expertise.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => router.push(`/profile/${user.username}`)}
                    className="w-full mt-3"
                    size="sm"
                  >
                    View Profile
                  </Button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  onClick={() => handleSearch(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      onClick={() => handleSearch(pageNum)}
                      variant={currentPage === pageNum ? "solid" : "outline"}
                      size="sm"
                      disabled={isLoading}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  onClick={() => handleSearch(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}

        {/* No Results */}
        {!isLoading && users.length === 0 && totalResults === 0 && currentPage === 1 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg">
              {searchQuery || selectedRole || selectedExpertise.length > 0
                ? "No users found matching your criteria. Try adjusting your filters."
                : "Use the filters above to search for users"}
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Searching...</p>
          </div>
        )}
      </div>
    </div>
  );
}
