-- CreateTable
CREATE TABLE "Setting" (
    "id" SERIAL NOT NULL,
    "item" TEXT NOT NULL,
    "keywords" TEXT NOT NULL,
    "createdAT" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Setting_item_key" ON "Setting"("item");
