-- CreateEnum
CREATE TYPE "CollegeType" AS ENUM ('PUBLIC', 'PRIVATE_NON_PROFIT', 'PRIVATE_FOR_PROFIT');

-- CreateEnum
CREATE TYPE "CampusSetting" AS ENUM ('URBAN', 'SUBURBAN', 'RURAL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colleges" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "fees" INTEGER NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "logoUrl" TEXT,
    "coverImageUrl" TEXT,
    "websiteUrl" TEXT,
    "type" "CollegeType" NOT NULL DEFAULT 'PUBLIC',
    "campusSetting" "CampusSetting" NOT NULL DEFAULT 'URBAN',
    "nationalRanking" INTEGER,
    "acceptanceRate" DOUBLE PRECISION,
    "graduationRate" DOUBLE PRECISION,
    "studentBodySize" INTEGER,
    "studentFacultyRatio" INTEGER,
    "inStateTuition" INTEGER,
    "outOfStateTuition" INTEGER,
    "avgFinancialAid" INTEGER,
    "roomAndBoard" INTEGER,
    "avgSatScore" INTEGER,
    "avgActScore" INTEGER,
    "avgGpa" DOUBLE PRECISION,
    "applicationDeadline" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colleges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "fees" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placements" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "averagePackage" DOUBLE PRECISION NOT NULL,
    "highestPackage" DOUBLE PRECISION NOT NULL,
    "placementRate" DOUBLE PRECISION NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "placements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_colleges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_colleges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "colleges_slug_key" ON "colleges"("slug");

-- CreateIndex
CREATE INDEX "colleges_slug_idx" ON "colleges"("slug");

-- CreateIndex
CREATE INDEX "colleges_name_idx" ON "colleges"("name");

-- CreateIndex
CREATE INDEX "colleges_location_idx" ON "colleges"("location");

-- CreateIndex
CREATE INDEX "colleges_state_idx" ON "colleges"("state");

-- CreateIndex
CREATE INDEX "colleges_fees_idx" ON "colleges"("fees");

-- CreateIndex
CREATE INDEX "colleges_rating_idx" ON "colleges"("rating");

-- CreateIndex
CREATE INDEX "colleges_nationalRanking_idx" ON "colleges"("nationalRanking");

-- CreateIndex
CREATE INDEX "colleges_acceptanceRate_idx" ON "colleges"("acceptanceRate");

-- CreateIndex
CREATE INDEX "courses_collegeId_idx" ON "courses"("collegeId");

-- CreateIndex
CREATE INDEX "placements_collegeId_idx" ON "placements"("collegeId");

-- CreateIndex
CREATE INDEX "reviews_collegeId_idx" ON "reviews"("collegeId");

-- CreateIndex
CREATE INDEX "reviews_userId_idx" ON "reviews"("userId");

-- CreateIndex
CREATE INDEX "saved_colleges_collegeId_idx" ON "saved_colleges"("collegeId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_colleges_userId_collegeId_key" ON "saved_colleges"("userId", "collegeId");

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placements" ADD CONSTRAINT "placements_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_colleges" ADD CONSTRAINT "saved_colleges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_colleges" ADD CONSTRAINT "saved_colleges_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
